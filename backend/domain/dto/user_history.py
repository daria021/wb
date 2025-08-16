from datetime import datetime
from typing import Optional, Literal, Any
from uuid import UUID

from pydantic.main import IncEx

from domain.dto.base import CreateDTO, UpdateDTO
from infrastructure.enums.action import Action


class CreateUserHistoryDTO(CreateDTO):
    user_id: UUID
    creator_id: Optional[UUID]
    product_id: UUID
    action: Action # опубликовался в каталог, заархивирован, отредактирован
    date: datetime
    json_before: Optional[dict] = None
    json_after: Optional[dict] = None


class UpdateUserHistoryDTO(UpdateDTO):
    user_id: Optional[UUID] = None
    creator_id: Optional[UUID] = None
    product_id: Optional[UUID] = None
    action: Optional[Action] = None
    date: Optional[datetime] = None
    json_before: Optional[dict] = None
    json_after: Optional[dict] = None