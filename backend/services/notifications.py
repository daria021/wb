import logging
from dataclasses import dataclass
from uuid import UUID

from aiogram import Bot
from aiogram.exceptions import TelegramBadRequest
from aiogram.types import FSInputFile, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder


from abstractions.repositories import (
    OrderRepositoryInterface,
    ProductRepositoryInterface,
    UserRepositoryInterface,
)
from abstractions.repositories.push import PushRepositoryInterface
from abstractions.repositories.user_push import UserPushRepositoryInterface
from abstractions.services.deeplink import DeeplinkServiceInterface
from abstractions.services.notification import NotificationServiceInterface
from abstractions.services.upload import UploadServiceInterface
from domain.dto import CreatePushDTO, UpdatePushDTO, CreateUserPushDTO
from domain.models import Push
from infrastructure.enums.product_status import ProductStatus
from settings import settings

logger = logging.getLogger(__name__)


@dataclass
class NotificationService(NotificationServiceInterface):
    bot_token: str
    orders_repository: OrderRepositoryInterface
    users_repository: UserRepositoryInterface
    products_repository: ProductRepositoryInterface
    push_repository: PushRepositoryInterface
    user_push_repository: UserPushRepositoryInterface
    upload_service: UploadServiceInterface
    deeplink_service: DeeplinkServiceInterface

    _bot: Bot = None

    # ---------- infra ----------
    @property
    def bot(self) -> Bot:
        if self._bot is None:
            self._bot = Bot(token=self.bot_token)
        return self._bot

    async def _make_miniapp_link(self, path: str) -> str:
        deeplink = await self.deeplink_service.ensure_deeplink(path)

        payload = f"link_{deeplink.key}"

        return (
            f"https://t.me/{settings.bot.username}/"
            f"{settings.bot.app_short_name}"
            f"?startapp={payload}&mode=compact"
        )

    # ---------- публичные методы ----------
    async def send_cashback_paid(self, order_id: UUID) -> None:
        order = await self.orders_repository.get(order_id)
        user = await self.users_repository.get(order.user_id)
        await self.bot.send_message(
            chat_id=user.telegram_id,
            text=f'Ваш кешбэк по заказу {order.name} выплачен! 💰',
        )
    # ---------- публичные методы ----------
    async def send_cashback_rejected(self, order_id: UUID) -> None:
        order = await self.orders_repository.get(order_id)
        user = await self.users_repository.get(order.user_id)
        await self.bot.send_message(
            chat_id=user.telegram_id,
            text=f"Кешбэк по заказу {order.name} отклонен.",
        )

    async def send_balance_increased(self, user_id: UUID, amount: int) -> None:
        user = await self.users_repository.get(user_id)
        await self.bot.send_message(
            chat_id=user.telegram_id,
            text=f"Ваш баланс пополнен на {amount} раздач 📈",
        )

    async def send_new_product(self, product_id: UUID) -> None:
        product = await self.products_repository.get(product_id)
        if product.status is not ProductStatus.ACTIVE:
            return

        kb = InlineKeyboardBuilder()
        kb.button(
            text="Карточка товара 🏷",
            url=await self._make_miniapp_link(f"/product/{product.id}"),
        )
        kb.button(
            text="Каталог продавца 📂",
            url=await self._make_miniapp_link(f"/catalog?seller={product.seller_id}"),
        )
        kb.button(
            text="Весь каталог 🛍",
            url=await self._make_miniapp_link("/catalog"),
        )
        kb.adjust(1)  # по одной кнопке в строке

        caption = (
            f"🛒 <b>Новый товар!</b>\n"
            f"{product.name}\n"
            f"Цена: <b>{product.price} ₽</b>"
        )

        # Если канал не задан — выходим тихо (не ломаем модерацию)
        channel_id = getattr(settings.bot, "channel_id", None)
        if not channel_id:
            logger.warning("Notification skipped: settings.bot.channel_id is not set")
            return

        # Попробуем отправить фото в нужный топик (если указан и чат поддерживает темы)
        thread_id = getattr(settings.bot, "free_topic_id", None) if product.price == 0 else getattr(settings.bot, "paid_topic_id", None)
        try:
            photo_path = self.upload_service.get_file_path(product.image_path)
            input_file = FSInputFile(photo_path)

            kwargs = dict(
                chat_id=channel_id,
                photo=input_file,
                caption=caption,
                parse_mode="HTML",
                reply_markup=kb.as_markup(),
            )
            if thread_id:
                kwargs["message_thread_id"] = thread_id

            await self.bot.send_photo(**kwargs)
        except TelegramBadRequest as e:
            # Фоллбек: если канал/топик не найден или нет прав — не валим модерацию
            logger.warning(f"send_photo failed: {e}. Falling back to send_message without photo")
            try:
                kwargs = dict(
                    chat_id=channel_id,
                    text=caption,
                    parse_mode="HTML",
                    reply_markup=kb.as_markup(),
                )
                if thread_id:
                    kwargs["message_thread_id"] = thread_id
                await self.bot.send_message(**kwargs)
            except Exception as e2:
                logger.error(f"send_message fallback failed: {e2}")
        except Exception as e:
            logger.error(f"Unexpected error while sending new product notification: {e}")

    async def create_push(self, push: CreatePushDTO) -> None:
        await self.push_repository.create(push)

    async def activate_push(self, push_id: UUID, user_ids: list[UUID]) -> None:
        dtos = [CreateUserPushDTO(push_id=push_id, user_id=user_id) for user_id in user_ids]
        await self.user_push_repository.create_many(dtos)

    async def get_push(self, push_id: UUID) -> Push:
        return await self.push_repository.get(push_id)

    async def get_pushes(self) -> list[Push]:
        return await self.push_repository.get_all()

    async def update_push(self, push_id: UUID, push: UpdatePushDTO) -> None:
        return await self.push_repository.update(push_id, push)

    async def delete_push(self, push_id: UUID) -> None:
        return await self.push_repository.delete(push_id)

    async def send_order_progress_reminder(self, user_id: UUID, order_id: UUID) -> None:
        user = await self.users_repository.get(user_id)
        order = await self.orders_repository.get(order_id)

        # Подбираем корректный маршрут для продолжения шага
        if order.step is None or order.step in (0, 1):
            # Шаг 1 в роутинге идёт как /product/:orderId/step-1
            path = f"product/{order.id}/step-1"
        elif 2 <= order.step <= 7:
            path = f"order/{order.id}/step-{order.step}"
        else:
            # Запасной вариант — список покупок
            path = "user/orders"

        # Для web_app-кнопки используем прямой URL миниаппа
        web_app_url = f"{settings.web.url}{path}"

        kb = InlineKeyboardBuilder()
        kb.button(
            text="Продолжить выкуп",
            web_app=WebAppInfo(url=web_app_url),
        )

        # Текст с названием товара и эмодзи
        product_name = getattr(getattr(order, "product", None), "name", None)
        if not product_name and order.product_id:
            try:
                product = await self.products_repository.get(order.product_id)
                product_name = getattr(product, "name", None)
            except Exception:
                product_name = None

        text = (
            f"🛒 Вы начали выкуп товара «{product_name or 'ваш товар'}», но не завершили.\n"
            f"Нажмите кнопку ниже, чтобы продолжить и получить кешбэк 💸"
        )
        await self.bot.send_message(
            chat_id=user.telegram_id,
            text=text,
            reply_markup=kb.as_markup(),
        )
