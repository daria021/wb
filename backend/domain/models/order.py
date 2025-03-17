from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from domain.models import Product


class Order(BaseModel):
    id: UUID
    user_id: UUID
    product_id: UUID
    card_number: str
    screenshot_path: str
    status: str
    created_at: datetime
    updated_at: datetime

    product: Product

    model_config = ConfigDict(from_attributes=True)

