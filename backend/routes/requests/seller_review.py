from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SellerReviewRequest(BaseModel):
    seller_nickname: str
    rating: int = Field(ge=1, le=5)
    review: Optional[str] = None