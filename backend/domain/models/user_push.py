from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from pydantic import ConfigDict

from domain.models import User
from domain.models.push import Push
from infrastructure.enums.push_status import PushStatus


class UserPush(BaseModel):
    id: UUID
    push_id: UUID
    user_id: UUID
    sent_at: Optional[datetime] = None
    status: PushStatus
    created_at: datetime
    updated_at: datetime

    push: Optional[Push] = None
    user: Optional[User] = None

    model_config = ConfigDict(from_attributes=True)
