from typing import Optional

from pydantic import BaseModel


class Notification(BaseModel):
    text: str
    chat_id: int
    image_path: Optional[str] = None
