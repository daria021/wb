from typing import Optional

from pydantic import Field

from domain.dto.base import CreateDTO, UpdateDTO
from infrastructure.enums.user_role import UserRole


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

