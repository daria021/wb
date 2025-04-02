from abc import ABC, abstractmethod
from uuid import UUID


class NotificationServiceInterface(ABC):
    @abstractmethod
    async def send_cashback_paid(self, order_id: UUID) -> None:
        ...
