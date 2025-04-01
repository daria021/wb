from typing import Optional
from pydantic import BaseModel, ConfigDict

from infrastructure.enums.order_status import OrderStatus


class OrderReport(BaseModel):
    step: int
    search_screenshot_path: Optional[str] = None
    cart_screenshot_path: Optional[str] = None
    card_number: Optional[str] = None
    article: Optional[str] = None
    phone_number: Optional[str] = None
    name: Optional[str] = None
    bank: Optional[str] = None
    final_cart_screenshot_path: Optional[str] = None
    delivery_screenshot_path: Optional[str] = None
    barcodes_screenshot_path: Optional[str] = None
    review_screenshot_path: Optional[str] = None
    receipt_screenshot_path: Optional[str] = None
    receipt_number: Optional[str] = None
    status: Optional[OrderStatus] = None
    model_config = ConfigDict(from_attributes=True)

