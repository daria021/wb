from datetime import datetime
from typing import Optional
from uuid import UUID

from infrastructure.db.enums.push_status import PushStatus
from .abstract import CreateDTO, UpdateDTO
from domain.models import User, Push


class CreateUserPushDTO(CreateDTO):
    push_id: UUID
    user_id: UUID
    sent_at: Optional[datetime]
    push: Push
    user: User

class UpdateUserPushDTO(UpdateDTO):
    push_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    sent_at: Optional[datetime] = None
    status: Optional[PushStatus] = None
