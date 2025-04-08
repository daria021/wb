from typing import Optional
from uuid import UUID
from domain.dto.base import CreateDTO, UpdateDTO
from domain.models import User


class CreatePushDTO(CreateDTO):
    title: str
    text: str
    creator_id: UUID
    image_path: Optional[str]

    creator: User

class UpdatePushDTO(UpdateDTO):
    title: Optional[str]
    text: Optional[str]
    creator_id: Optional[UUID]
    image_path: Optional[str]
    creator: Optional[User]

