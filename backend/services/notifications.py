from dataclasses import dataclass
from uuid import UUID

from httpx import AsyncClient

from abstractions.repositories import OrderRepositoryInterface, UserRepositoryInterface
from abstractions.services.notification import NotificationServiceInterface

@dataclass
class NotificationService(NotificationServiceInterface):
    token: str
    orders_repository: OrderRepositoryInterface
    users_repository: UserRepositoryInterface

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
