from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class Review(BaseModel):
    id: UUID
    user_id: UUID
    product_id: UUID
    rating: int
    comment: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

