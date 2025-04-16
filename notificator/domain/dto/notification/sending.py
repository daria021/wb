from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SendMessageDto(BaseModel):
    text: str
    chat_id: int
    image_path: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None


class MessageSendingResultDto(BaseModel):
    sent_at: Optional[datetime] = None
    error: Optional[str] = None
