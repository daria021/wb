from typing import Optional

from pydantic import BaseModel


class CreatePushRequest(BaseModel):
    title: str
    text: str
    image_path: Optional[str] = None
