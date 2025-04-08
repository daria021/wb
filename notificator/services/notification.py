from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from httpx import AsyncClient

from abstractions.repositories.user_push import UserPushRepositoryInterface
from abstractions.services.notification import NotificationServiceInterface
from domain.dto.notification import SendMessageDto, MessageSendingResultDto
from domain.models.user_push import UserPush
from infrastructure.db.enums.push_status import PushStatus


@dataclass
class Notificator(NotificationServiceInterface):
    token: str
    notifications_repository: UserPushRepositoryInterface

    async def send_notification(self, notification: UserPush) -> None:
        async def set_status(status: PushStatus, sent_at: Optional[datetime] = None):
            await self.notifications_repository.set_status(
                user_push_id=notification.id,
                status=status,
                sent_at=sent_at,
            )

        await set_status(PushStatus.IN_PROGRESS)

        message = SendMessageDto(
            text=notification.push.text,
            chat_id=notification.user.telegram_id,
            image_path=notification.push.image_path,
        )

        result = await self._send_message(message)
        if result.sent_at:
            await set_status(PushStatus.DELIVERED, datetime.now())
        if result.error:
            await set_status(PushStatus.FAILED)

    async def _send_message(self, message: SendMessageDto) -> MessageSendingResultDto:
        try:
            async with AsyncClient() as client:
                await client.post(
                    url=self._get_url(),
                    params={
                        'chat_id': message.chat_id,
                        'text': message.text,
                    }
                )

            return MessageSendingResultDto(
                sent_at=datetime.now(),
            )
        except Exception as e:
            return MessageSendingResultDto(
                error=str(e),
            )

    def _get_url(self) -> str:
        return f'https://api.telegram.org/bot{self.token}/sendMessage'
