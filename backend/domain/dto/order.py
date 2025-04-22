from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from domain.dto.base import CreateDTO, UpdateDTO
from infrastructure.enums.order_status import OrderStatus
from infrastructure.enums.product_status import ProductStatus


class CreateOrderDTO(CreateDTO):
    user_id: UUID
    product_id: UUID
    seller_id: UUID
    step: int
    status: OrderStatus = None
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



class UpdateOrderDTO(UpdateDTO):
    # user_id: Optional[UUID] = None
    # product_id: Optional[UUID] = None
    # seller_id: Optional[UUID] = None
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
    status: Optional[OrderStatus] = None
