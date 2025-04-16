from abc import ABC, abstractmethod
from typing import NoReturn

from abstractions.services.notification import NotificationServiceInterface


class ConsumerInterface(ABC):
    @abstractmethod
    async def execute(self, notificator: NotificationServiceInterface) -> NoReturn:
        ...
