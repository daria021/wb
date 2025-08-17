from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from infrastructure.enums.user_role import UserRole


class User(BaseModel):
    id: UUID
    telegram_id: Optional[int] = None
    nickname: Optional[str] = None
    role: UserRole
    is_banned: bool
    is_seller: bool
    balance: Optional[int] = None
    invited_by: Optional[UUID] = None
    has_discount: Optional[bool] = None
    referrer_bonus: Optional[int] = None
    phone_number: Optional[str] = None

    inviter: Optional['User'] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
