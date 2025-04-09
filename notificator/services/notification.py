import json
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
import os

from httpx import AsyncClient

from abstractions.repositories.user_push import UserPushRepositoryInterface
from abstractions.services.notification import NotificationServiceInterface
from dependencies.services.upload import get_upload_service
from domain.dto.notification import SendMessageDto, MessageSendingResultDto
from domain.models.user_push import UserPush
from infrastructure.db.enums.push_status import PushStatus


logger = logging.getLogger(__name__)

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

        upload_service = get_upload_service()
        message = SendMessageDto(
            text=notification.push.text,
            chat_id=notification.user.telegram_id,
            image_path=upload_service.get_filepath(notification.push.image_path),
            button_text=notification.push.button_text,
            button_link=notification.push.button_link,
        )

        result = await self._send_message(message)
        if result.sent_at:
            await set_status(PushStatus.DELIVERED, datetime.now())
        if result.error:
            await set_status(PushStatus.FAILED)
            logger.error(result.error)

    async def _send_message(self, message: SendMessageDto) -> MessageSendingResultDto:
        try:
            reply_markup = None
            # Use the web_app field for a miniapp button
            if message.button_text and message.button_link:
                inline_keyboard = [[{"text": message.button_text, "web_app": {"url": message.button_link}}]]
                reply_markup = json.dumps({"inline_keyboard": inline_keyboard})

            async with AsyncClient() as client:
                if message.image_path:
                    with open(message.image_path, "rb") as image_file:
                        filename = os.path.basename(message.image_path)
                        files = {
                            "photo": (filename, image_file, "application/octet-stream")
                        }
                        data = {
                            "chat_id": message.chat_id,
                            "caption": message.text,
                        }
                        if reply_markup:
                            data["reply_markup"] = reply_markup
                        url = f'https://api.telegram.org/bot{self.token}/sendPhoto'
                        response = await client.post(url, data=data, files=files)
                else:
                    params = {
                        "chat_id": message.chat_id,
                        "text": message.text,
                    }
                    if reply_markup:
                        params["reply_markup"] = reply_markup
                    url = f'https://api.telegram.org/bot{self.token}/sendMessage'
                    response = await client.post(url, params=params)

                response.raise_for_status()

            return MessageSendingResultDto(sent_at=datetime.now())
        except Exception as e:
            logger.exception("Error sending message")
            return MessageSendingResultDto(error=str(e))
