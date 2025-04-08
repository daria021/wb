from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from pydantic import ConfigDict

from domain.models import User
from domain.models.push import Push


class UserPush(BaseModel):
    push_id: UUID
    user_id: UUID
    sent_at: Optional[datetime]
    push: Push
    user: User
    model_config = ConfigDict(from_attributes=True)


