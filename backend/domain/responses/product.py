from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from domain.models.moderator_review import ModeratorReview
from infrastructure.enums.category import Category
from infrastructure.enums.payout_time import PayoutTime
from infrastructure.enums.product_status import ProductStatus


class ProductResponse(BaseModel):
    id: UUID
    name: str
    brand: str
    article: str
    category: Category
    key_word: str
    general_repurchases: int
    daily_repurchases: int
    price: float
    wb_price: float
    tg: str
    payment_time: PayoutTime
    review_requirements: str
    image_path: str | None = None
    seller_id: UUID
    status: ProductStatus
    created_at: datetime
    updated_at: datetime

    last_moderator_review: Optional[ModeratorReview] = None

    model_config = ConfigDict(from_attributes=True)