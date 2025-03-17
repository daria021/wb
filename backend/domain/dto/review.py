from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from domain.dto.base import CreateDTO, UpdateDTO


class CreateReviewDTO(CreateDTO):
    user_id: UUID
    product_id: UUID
    rating: int
    comment: str

class UpdateReviewDTO(UpdateDTO):
    rating: Optional[int] = None
    comment: Optional[str] = None
