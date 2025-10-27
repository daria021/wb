from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from fastapi import UploadFile
from infrastructure.enums.category import Category
from infrastructure.enums.payout_time import PayoutTime
from infrastructure.enums.product_status import ProductStatus


class UpdateProductForm(BaseModel):
    name: Optional[str] = None
    article: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[Category] = None
    key_word: Optional[str] = None
    general_repurchases: Optional[int] = None
    # daily_repurchases: Optional[int] = None
    price: Optional[float] = None
    wb_price: Optional[float] = None
    tg: Optional[str] = None
    status: Optional[ProductStatus] = None
    payment_time: Optional[PayoutTime] = None
    review_requirements: Optional[str] = None
    image: Optional[UploadFile] = None
    always_show: Optional[bool] = None
