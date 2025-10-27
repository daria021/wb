from typing import Optional, Literal, Any
from uuid import UUID

from pydantic import Field
from pydantic.main import IncEx

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
    remaining_products: int
    # daily_repurchases: int
    price: float
    wb_price: float
    tg: str
    payment_time: PayoutTime
    review_requirements: str
    requirements_agree: bool
    seller_id: UUID
    status: ProductStatus = Field(default=ProductStatus.CREATED)
    image_path: Optional[str] = None
    always_show: bool = False


class UpdateProductDTO(UpdateDTO):
    name: Optional[str] = None
    brand: Optional[str] = None
    article: Optional[str] = None
    category: Optional[Category] = None
    key_word: Optional[str] = None
    general_repurchases: Optional[int] = None
    remaining_products: Optional[int] = None
    # daily_repurchases: Optional[int] = None
    price: Optional[float] = None
    wb_price: Optional[float] = None
    tg: Optional[str] = None
    status: Optional[ProductStatus] = None
    payment_time: Optional[PayoutTime] = None
    review_requirements: Optional[str] = None
    requirements_agree: Optional[bool] = None
    image_path: Optional[str] = None
    always_show: Optional[bool] = None
