from typing import Optional
from uuid import UUID

from .abstract import CreateDTO, UpdateDTO


class CreatePushDTO(CreateDTO):
    title: str
    text: str
    creator_id: UUID
    image_path: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None


class UpdatePushDTO(UpdateDTO):
    title: Optional[str] = None
    text: Optional[str] = None
    creator_id: Optional[UUID] = None
    image_path: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
