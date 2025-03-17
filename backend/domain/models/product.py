from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from infrastructure.enums.category import Category
from infrastructure.enums.payout_time import PayoutTime


class Product(BaseModel):
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
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

