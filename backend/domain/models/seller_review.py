from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SellerReview(BaseModel):
    id: UUID
    seller_id: UUID
    sender_id: UUID
    review: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)



