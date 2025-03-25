from dataclasses import dataclass
from typing import List
from uuid import UUID

from abstractions.repositories import OrderRepositoryInterface, ProductRepositoryInterface
from abstractions.services import OrderServiceInterface
from domain.dto import UpdateOrderDTO, CreateOrderDTO
from domain.models import Order
from domain.responses.order_report import OrderReport


@dataclass
class OrderService(OrderServiceInterface):
    order_repository: OrderRepositoryInterface
    product_repository: ProductRepositoryInterface
    async def create_order(self, dto: CreateOrderDTO) -> UUID:
        await self.order_repository.create(dto)
        order = await self.order_repository.get(dto.id)
        return order.id

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

    async def get_user_report(self, order_id: UUID) -> OrderReport:
        order = await self.order_repository.get(order_id)
        product = await self.product_repository.get(order.product_id)
        order_dict = order.model_dump()
        order_dict['article'] = product.article
        order_report = OrderReport.model_validate(order_dict)
        return order_report

    async def get_orders_by_seller(self, seller_id: UUID) -> list[Order]:
        orders = await self.order_repository.get_orders_by_seller(seller_id)
        return orders


