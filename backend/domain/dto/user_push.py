from datetime import datetime
from typing import Optional
from uuid import UUID

from domain.dto.base import CreateDTO, UpdateDTO
from domain.models import User
from infrastructure.entities import Push


class CreateUserPushDTO(CreateDTO):
    push_id: UUID
    user_id: UUID
    sent_at: Optional[datetime]
    push: Push
    user: User

class UpdateUserPushDTO(UpdateDTO):
    push_id: Optional[UUID]
    user_id: Optional[UUID]
    sent_at: Optional[datetime]
    push: Optional[Push]
    user: Optional[User]
