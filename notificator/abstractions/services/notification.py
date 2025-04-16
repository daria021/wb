from abc import ABC, abstractmethod

from domain.models import UserPush


class NotificationServiceInterface(ABC):
    @abstractmethod
    async def send_notification(self, notification: UserPush) -> None:
        ...
