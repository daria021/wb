from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from domain.dto.order import CreateOrderDTO, UpdateOrderDTO
from domain.models.order import Order
from domain.responses.order_report import OrderReport


class OrderServiceInterface(ABC):
    @abstractmethod
    async def create_order(self, order_dto: CreateOrderDTO) -> UUID:
        """
        Создаёт новый заказ и возвращает его доменную модель.
        """
        ...

    @abstractmethod
    async def get_order(self, order_id: UUID) -> Order:
        """
        Возвращает заказ по его ID.
        """
        ...

    @abstractmethod
    async def update_order(self, order_id: UUID, update_dto: UpdateOrderDTO) -> None:
        """
        Обновляет данные заказа с указанным ID.
        """
        ...

    @abstractmethod
    async def delete_order(self, order_id: UUID) -> None:
        """
        Удаляет заказ с указанным ID.
        """

    @abstractmethod
    async def get_orders(self, limit: int = 100, offset: int = 0) -> None:
        """
        Удаляет заказ с указанным ID.
        """
        ...

    @abstractmethod
    async def get_orders_by_user(self, user_id: UUID) -> List[Order]:
        """
        Возвращает список заказов для указанного пользователя.
        """
        ...

    @abstractmethod
    async def get_user_report(self, order_id: UUID) -> OrderReport:
        ...

    @abstractmethod
    async def get_orders_by_seller(self, seller_id: UUID) -> list[Order]:
        ...

