from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from infrastructure.enums.action import Action


class UserHistory(BaseModel):
    id: UUID
    user_id: UUID
    creator_id: Optional[UUID]
    product_id: UUID
    action: Action # опубликовался в каталог, заархивирован, отредактирован
    date: datetime
    json_before: Optional[dict]
    json_after: Optional[dict]
    created_at: datetime
    updated_at: datetime
