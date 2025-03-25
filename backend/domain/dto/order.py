from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from domain.dto.base import CreateDTO, UpdateDTO


class CreateOrderDTO(CreateDTO):
    user_id: UUID
    product_id: UUID
    seller_id: UUID
    step: int
    search_screenshot_path: Optional[str] = None
    cart_screenshot_path: Optional[str] = None
    card_number: Optional[str] = None
    phone_number: Optional[str] = None
    name: Optional[str] = None
    bank: Optional[str] = None
    final_cart_screenshot_path: Optional[str] = None
    delivery_screenshot_path: Optional[str] = None
    barcodes_screenshot_path: Optional[str] = None
    review_screenshot_path: Optional[str] = None
    receipt_screenshot_path: Optional[str] = None
    receipt_number: Optional[str] = None
    status: str



class UpdateOrderDTO(UpdateDTO):
    step: Optional[int] = None
    search_screenshot_path: Optional[str] = None
    cart_screenshot_path: Optional[str] = None
    card_number: Optional[str] = None
    phone_number: Optional[str] = None
    name: Optional[str] = None
    bank: Optional[str] = None
    final_cart_screenshot_path: Optional[str] = None
    delivery_screenshot_path: Optional[str] = None
    barcodes_screenshot_path: Optional[str] = None
    review_screenshot_path: Optional[str] = None
    receipt_screenshot_path: Optional[str] = None
    receipt_number: Optional[str] = None
    status: Optional[str] = None
