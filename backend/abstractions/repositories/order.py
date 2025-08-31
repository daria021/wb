from abc import ABC, abstractmethod
from typing import List
from datetime import datetime
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

    @abstractmethod
    async def get_all_orders_by_seller(self, seller_id: UUID) -> list[Order]:
        ...

    @abstractmethod
    async def get_in_progress_orders_by_seller(self, seller_id: UUID) -> list[Order]:
        ...

    @abstractmethod
    async def exists_by_code(self, transaction_code: str) -> bool:
        ...

    @abstractmethod
    async def get_inactive_orders(self, cutoff: datetime) -> list[Order]:
        """Вернуть заказы без движения до указанной даты (для напоминаний/отмен)."""
        ...

    @abstractmethod
    async def get_inactive_after_reminder(self, cutoff: datetime) -> list[Order]:
        """Вернуть заказы без движения после отправленного напоминания (для отмены)."""
        ...
