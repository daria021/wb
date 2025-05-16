import logging
from dataclasses import dataclass
from uuid import UUID

from httpx import AsyncClient

from abstractions.repositories import OrderRepositoryInterface, UserRepositoryInterface
from abstractions.repositories.push import PushRepositoryInterface
from abstractions.repositories.user_push import UserPushRepositoryInterface
from abstractions.services.notification import NotificationServiceInterface
from abstractions.services.upload import UploadServiceInterface
from domain.dto import CreatePushDTO, CreateUserPushDTO, UpdatePushDTO
from domain.models import Push

from abstractions.repositories import ProductRepositoryInterface
from infrastructure.enums.product_status import ProductStatus
from settings import settings

logger = logging.getLogger(__name__)

@dataclass
class NotificationService(NotificationServiceInterface):
    token: str
    orders_repository: OrderRepositoryInterface
    users_repository: UserRepositoryInterface
    push_repository: PushRepositoryInterface
    user_push_repository: UserPushRepositoryInterface
    products_repository: ProductRepositoryInterface
    upload_service: UploadServiceInterface

    async def send_cashback_paid(self, order_id: UUID) -> None:
        order = await self.orders_repository.get(order_id)
        user = await self.users_repository.get(order.user_id)
        async with AsyncClient() as client:
            await client.post(
                url=f'https://api.telegram.org/bot{self.token}/sendMessage',
                params={
                    'chat_id': user.telegram_id,
                    'text': 'Ваш кешбек выплачен!',
                }
            )

    async def send_balance_increased(self, user_id: UUID, amount: int) -> None:
        user = await self.users_repository.get(user_id)
        async with AsyncClient() as client:
            await client.post(
                url=f'https://api.telegram.org/bot{self.token}/sendMessage',
                params={
                    'chat_id': user.telegram_id,
                    'text': f'Ваш баланс полонен на {amount} раздач',
                }
            )

    async def send_new_product(self, product_id: UUID) -> None:
        product = await self.products_repository.get(product_id)
        if product.status == ProductStatus.ACTIVE:

            data = {
                "chat_id": settings.bot.channel_id,
                "caption": f"🛒 Новый товар в каталоге!\n{product.name}\nЦена: {product.price} ₽"
            }
            product_image_path = self.upload_service.get_file_path(product.image_path)
            with open(product_image_path, "rb") as img:
                files = {"photo": img}
                async with AsyncClient() as client:
                    response = await client.post(
                        url=f'https://api.telegram.org/bot{self.token}/sendPhoto',
                        data=data,
                        files=files
                    )

                logger.info(response.content.decode())

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
