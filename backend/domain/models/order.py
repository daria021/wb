from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from domain.models import Product, User


class Order(BaseModel):
    id: UUID
    user_id: UUID
    product_id: UUID
    seller_id: UUID
    step: int
    search_screenshot_path: Optional[str]
    cart_screenshot_path: Optional[str]
    card_number: Optional[str]
    phone_number: Optional[str]
    name: Optional[str]
    bank: Optional[str]
    final_cart_screenshot_path: Optional[str]
    delivery_screenshot_path: Optional[str]
    barcodes_screenshot_path: Optional[str]
    review_screenshot_path: Optional[str]
    receipt_screenshot_path: Optional[str]
    receipt_number: Optional[str]
    status: str

    product: Product
    user: User
    seller: User

    model_config = ConfigDict(from_attributes=True)

