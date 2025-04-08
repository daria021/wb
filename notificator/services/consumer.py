from asyncio import sleep
from dataclasses import dataclass, field
from typing import NoReturn

from abstractions.repositories.user_push import UserPushRepositoryInterface
from abstractions.services.consumer import ConsumerInterface
from abstractions.services.notification import NotificationServiceInterface


@dataclass
class Consumer(ConsumerInterface):
    notification_repository: UserPushRepositoryInterface

    global_notification_delay: int = field(default=1)
    inner_notification_delay: int = field(default=1)

    async def execute(self, notificator: NotificationServiceInterface) -> NoReturn:
        while True:
            notifications_to_send = await self.notification_repository.get_queued_pushes()
            for notification in notifications_to_send:
                await notificator.send_notification(notification)
                await sleep(self.inner_notification_delay)

            await sleep(self.global_notification_delay)
