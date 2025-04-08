from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import ConfigDict

from infrastructure.db.enums.push_status import PushStatus
from .abstract import Model
from .push import Push
from .user import User


class UserPush(Model):
    push_id: UUID
    user_id: UUID
    sent_at: Optional[datetime] = None
    status: PushStatus

    push: Push
    user: User

    model_config = ConfigDict(from_attributes=True)
