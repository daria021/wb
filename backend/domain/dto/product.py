from typing import Optional
from uuid import UUID

from domain.dto.base import CreateDTO, UpdateDTO
from infrastructure.enums.category import Category
from infrastructure.enums.payout_time import PayoutTime
from infrastructure.enums.product_status import ProductStatus


class CreateProductDTO(CreateDTO):
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
    seller_id: UUID
    image_path: Optional[str] = None


class UpdateProductDTO(UpdateDTO):
    name: Optional[str] = None
    brand: Optional[str] = None
    article: Optional[str] = None
    category: Optional[Category] = None
    key_word: Optional[str] = None
    general_repurchases: Optional[int] = None
    daily_repurchases: Optional[int] = None
    price: Optional[float] = None
    wb_price: Optional[float] = None
    tg: Optional[str] = None
    payment_time: Optional[PayoutTime] = None
    review_requirements: Optional[str] = None
    image_path: Optional[str] = None
    status: Optional[ProductStatus] = None
