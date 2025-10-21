from typing import Optional
from uuid import UUID


from domain.dto.base import CreateDTO, UpdateDTO


class CreateSellerReviewDTO(CreateDTO):
    seller_id: UUID
    sender_id: UUID
    rating: int
    review: Optional[str] = None

class UpdateSellerReviewDTO(UpdateDTO):
    seller_id: Optional[UUID] = None
    sender_id: Optional[UUID] = None
    rating: Optional[int] = None
    review: Optional[str] = None

