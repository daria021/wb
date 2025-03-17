from uuid import UUID

from pydantic import BaseModel, Field
from typing import Optional

class CreateReviewRequest(BaseModel):
    user_id: UUID = Field(..., description="ID юзера, который оценивается")
    product_id: UUID = Field(..., description="ID продукта, который оценивается")
    rating: int = Field(..., ge=1, le=5, description="Оценка продукта от 1 до 5")
    comment: str = Field(..., description="Комментарий к отзыву")

class UpdateReviewRequest(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5, description="Обновлённая оценка продукта (от 1 до 5)")
    comment: Optional[str] = Field(None, description="Обновлённый комментарий")
