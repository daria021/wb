from typing import Optional
from uuid import UUID

from pydantic import ConfigDict

from domain.models import User
from .abstract import Model


class Push(Model):
    title: str
    text: str
    creator_id: UUID
    image_path: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None

    creator: Optional[User] = None

    model_config = ConfigDict(from_attributes=True)
