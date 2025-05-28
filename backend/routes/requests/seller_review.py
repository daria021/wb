from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class SellerReviewRequest(BaseModel):
    seller_nickname: str
    review: Optional[str] = None