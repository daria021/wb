from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from domain.models import Product, User
from infrastructure.enums.order_status import OrderStatus
from infrastructure.enums.product_status import ProductStatus


class Order(BaseModel):
    id: UUID
    transaction_code: str #номер сделки
    user_id: UUID
    product_id: Optional[UUID] = None
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
    status: OrderStatus
    order_date: datetime

    product: Optional[Product] = None
    user: User
    seller: User
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

