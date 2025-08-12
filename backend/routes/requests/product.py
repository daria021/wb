from typing import Optional

from pydantic import BaseModel, Field

from infrastructure.enums.category import Category
from infrastructure.enums.payout_time import PayoutTime


class CreateProductRequest(BaseModel):
    name: str = Field(..., description="Название товара")
    article: str = Field(..., description="Уникальный артикул товара")
    brand: str = Field(..., description="Бренд товара")
    category: Category = Field(..., description="Категория товара")
    key_word: str = Field(..., description="Ключевое слово")
    general_repurchases: int = Field(..., description="Общий план по выкупам")
    # daily_repurchases: int = Field(..., description="План по выкупам на день")
    price: float = Field(..., gt=0, description="Цена товара")
    wb_price: float = Field(..., description="Цена товара на вб")
    tg: str = Field(..., description="Телеграм для связи с продавцом")
    payment_time: PayoutTime = Field(..., description="Время выплаты")
    review_requirements: str = Field(..., description="Требования к отзыву")
    image_path: Optional[str] = Field(None, description="Путь к изображению товара")


class UpdateProductRequest(BaseModel):
    name: Optional[str] = Field(None, description="Название товара")
    article: Optional[str] = Field(None, description="Уникальный артикул товара")
    brand: Optional[str] = Field(None, description="Бренд товара")
    category: Category = Field(..., description="Категория товара")
    key_word: Optional[str] = Field(None, description="Ключевое слово")
    general_repurchases: Optional[int] = Field(None, description="Общий план по выкупам")
    # daily_repurchases: Optional[int] = Field(None, description="План по выкупам на день")
    price: Optional[float] = Field(None, gt=0, description="Цена товара")
    wb_price: Optional[float] = Field(None, description="Цена товара на вб")
    tg: Optional[str] = Field(None, description="Телеграм для связи с продавцом")
    payment_time: Optional[PayoutTime] = Field(None, description="Время выплаты")
    review_requirements: Optional[str] = Field(None, description="Требования к отзыву")
    image_path: Optional[str] = Field(None, description="Путь к изображению товара")
