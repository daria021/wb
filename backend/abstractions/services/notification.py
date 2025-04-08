from abc import ABC, abstractmethod
from uuid import UUID

from domain.dto import CreatePushDTO
from domain.models import Push


class NotificationServiceInterface(ABC):
    @abstractmethod
    async def send_cashback_paid(self, order_id: UUID) -> None:
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
