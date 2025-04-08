from typing import Optional

from pydantic import ConfigDict

from infrastructure.db.enums import UserRole
from .abstract import Model


class User(Model):
    telegram_id: Optional[int] = None
    nickname: Optional[str] = None
    role: UserRole
    is_banned: bool
    is_seller: bool
    balance: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
