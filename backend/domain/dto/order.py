from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from domain.dto.base import CreateDTO, UpdateDTO


class CreateOrderDTO(CreateDTO):
    user_id: UUID
    product_id: UUID
    card_number: str
    screenshot_path: str
    status: Optional[str] = "pending"

class UpdateOrderDTO(UpdateDTO):
    card_number: Optional[str] = None
    # screenshot_path: Optional[str] = None
    status: Optional[str] = None
