from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

class CreateOrderRequest(BaseModel):
    user_id: UUID = Field(..., description="ID пользователя, который оформляет заказ")
    product_id: UUID = Field(..., description="ID продукта, который заказывается")
    card_number: str = Field(..., min_length=13, max_length=19, description="Номер карты для оплаты")


class UpdateOrderRequest(BaseModel):
    status: Optional[str] = Field(None, description="Новый статус заказа (например, 'pending', 'approved', 'rejected')")
    card_number: Optional[str] = Field(None, description="Новая карта")
