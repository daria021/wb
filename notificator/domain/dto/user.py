from typing import Optional

from pydantic import Field

from .abstract import CreateDTO, UpdateDTO
from infrastructure.db.enums import UserRole


class CreateUserDTO(CreateDTO):
    telegram_id: Optional[int]
    nickname: Optional[str] = None
    role: str = Field(default=UserRole.USER)



class UpdateUserDTO(UpdateDTO):
    telegram_id: Optional[int] = None
    nickname: Optional[str] = None
    role: Optional[str] = None
    is_banned: Optional[bool] = None
    is_seller: Optional[bool] = None
    balance: Optional[int] = None

