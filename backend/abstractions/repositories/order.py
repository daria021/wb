from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from abstractions.repositories import CRUDRepositoryInterface
from domain.dto import CreateOrderDTO, UpdateOrderDTO
from domain.models.order import Order


class OrderRepositoryInterface(
    CRUDRepositoryInterface[Order, CreateOrderDTO, UpdateOrderDTO],
    ABC):

    @abstractmethod
    async def get_orders_by_user(self, user_id: UUID) -> List[Order]:
        ...

    @abstractmethod
    async def get_user_report(self, order_id: UUID):
        ...

    @abstractmethod
    async def get_orders_by_seller(self, seller_id: UUID) -> list[Order]:
        ...




