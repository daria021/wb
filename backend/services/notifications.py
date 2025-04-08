from dataclasses import dataclass
from uuid import UUID

from httpx import AsyncClient

from abstractions.repositories import OrderRepositoryInterface, UserRepositoryInterface
from abstractions.repositories.push import PushRepositoryInterface
from abstractions.repositories.user_push import UserPushRepositoryInterface
from abstractions.services.notification import NotificationServiceInterface
from domain.dto import CreatePushDTO, CreateUserPushDTO
from domain.models import Push


@dataclass
class NotificationService(NotificationServiceInterface):
    token: str
    orders_repository: OrderRepositoryInterface
    users_repository: UserRepositoryInterface
    push_repository: PushRepositoryInterface
    user_push_repository: UserPushRepositoryInterface

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
                    'text': f'Ваш баланс раздач полонен на {amount}',
                }
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
