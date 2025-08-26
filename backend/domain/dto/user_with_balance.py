from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict
from infrastructure.enums.user_role import UserRole

class UserWithBalanceDTO(BaseModel):
    id: UUID
    telegram_id: Optional[int]
    nickname: Optional[str]
    role: UserRole
    balance: int
    is_banned: bool
    is_seller: bool
    created_at: datetime
    updated_at: datetime
    referrer_bonus: int

    # новые поля
    total_plan: int        # общий план (ACTIVE + NOT_PAID)
    reserved_active: int   # зарезервировано под ACTIVE
    unpaid_plan: int       # план под NOT_PAID
    free_balance: int      # balance – reserved_active
    in_progress: int

    model_config = ConfigDict(from_attributes=True)
