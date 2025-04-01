from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from infrastructure.enums.user_role import UserRole


class User(BaseModel):
    id: UUID
    telegram_id: Optional[int]
    nickname: Optional[str]
    role: UserRole
    is_banned: bool
    is_seller: bool
    balance: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
