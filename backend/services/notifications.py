import logging
from dataclasses import dataclass
from uuid import UUID

from aiogram import Bot
from aiogram.types import FSInputFile
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
            text="Ваш кешбек выплачен! 💰",
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

        # --- inline-кнопки c deep-link Mini-App ---
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

        photo_path = self.upload_service.get_file_path(product.image_path)
        input_file = FSInputFile(photo_path)

        await self.bot.send_photo(
            chat_id=settings.bot.channel_id,
            photo=input_file,
            caption=caption,
            parse_mode="HTML",
            reply_markup=kb.as_markup(),
        )

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
