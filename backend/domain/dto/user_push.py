from datetime import datetime
from typing import Optional
from uuid import UUID

from domain.dto.base import CreateDTO, UpdateDTO
from domain.models import User
from infrastructure.entities import Push


class CreateUserPushDTO(CreateDTO):
    push_id: UUID
    user_id: UUID

class UpdateUserPushDTO(UpdateDTO):
    push_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    sent_at: Optional[datetime] = None