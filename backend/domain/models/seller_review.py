from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SellerReview(BaseModel):
    id: UUID
    seller_id: UUID
    sender_id: UUID
    rating: int
    review: Optional[str] = None
    # вычисляемое поле для ответа API – не хранится в БД
    sender_nickname: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)



