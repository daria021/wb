from typing import Optional
from uuid import UUID
from domain.dto.base import CreateDTO, UpdateDTO
from domain.models import User


class CreatePushDTO(CreateDTO):
    title: str
    text: str
    creator_id: UUID
    image_path: Optional[str] = None

class UpdatePushDTO(UpdateDTO):
    title: Optional[str] = None
    text: Optional[str] = None
    image_path: Optional[str] = None
