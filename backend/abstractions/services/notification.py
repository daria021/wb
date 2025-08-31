from abc import ABC, abstractmethod
from uuid import UUID

from domain.dto import CreatePushDTO, UpdatePushDTO
from domain.models import Push


class NotificationServiceInterface(ABC):
    @abstractmethod
    async def send_cashback_paid(self, order_id: UUID) -> None:
        ...
    @abstractmethod
    async def send_cashback_rejected(self, order_id: UUID) -> None:
        ...

    @abstractmethod
    async def send_balance_increased(self, user_id: UUID, amount: int) -> None:
        ...

    @abstractmethod
    async def create_push(self, push: CreatePushDTO) -> None:
        ...

    @abstractmethod
    async def activate_push(self, push_id: UUID, user_ids: list[UUID]) -> None:
        ...

    @abstractmethod
    async def get_pushes(self) -> list[Push]:
        ...

    @abstractmethod
    async def get_push(self, push_id: UUID) -> Push:
        ...

    @abstractmethod
    async def update_push(self, push_id: UUID, push: UpdatePushDTO) -> None:
        ...

    @abstractmethod
    async def delete_push(self, push_id: UUID) -> None:
        ...

    @abstractmethod
    async def send_new_product(self, product_id: UUID) -> None:
        ...

    @abstractmethod
    async def send_order_progress_reminder(self, user_id: UUID, order_id: UUID) -> None:
        """Отправить пользователю напоминание о продолжении выкупа по заказу."""
        ...
