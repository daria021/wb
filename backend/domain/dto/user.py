from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from domain.dto.base import CreateDTO, UpdateDTO


class CreateUserDTO(CreateDTO):
    telegram_id: Optional[int]
    nickname: Optional[str] = None
    role: str = Field(default="user")


class UpdateUserDTO(UpdateDTO):
    telegram_id: Optional[int] = None
    nickname: Optional[str] = None
    role: Optional[str] = None
