from dataclasses import dataclass
from typing import List
from uuid import UUID

from abstractions.repositories import OrderRepositoryInterface
from abstractions.services import OrderServiceInterface
from domain.dto import UpdateOrderDTO, CreateOrderDTO
from domain.models import Order


@dataclass
class OrderService(OrderServiceInterface):
    order_repository: OrderRepositoryInterface

    async def create_order(self, dto: CreateOrderDTO) -> None:
        return await self.order_repository.create(dto)

    async def get_order(self, order_id: UUID) -> Order:
        return await self.order_repository.get(order_id)

    async def update_order(self, order_id: UUID, dto: UpdateOrderDTO) -> None:
        await self.order_repository.update(order_id, dto)

    async def delete_order(self, order_id: UUID) -> None:
        await self.order_repository.delete(order_id)

    async def get_orders(self, limit: int = 100, offset: int = 0) -> List[Order]:
        return await self.order_repository.get_all(limit=limit, offset=offset)

    async def get_orders_by_user(self, user_id: UUID) -> List[Order]:
        return await self.order_repository.get_orders_by_user(user_id=user_id)

