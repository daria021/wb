from typing import Optional
from uuid import UUID

from domain.dto.base import CreateDTO, UpdateDTO
from infrastructure.enums.product_status import ProductStatus


class CreateModeratorReviewDTO(CreateDTO):
    moderator_id: UUID
    product_id: UUID
    comment_to_seller: Optional[str] = None
    comment_to_moderator: Optional[str] = None
    status_before: ProductStatus
    status_after: ProductStatus


class UpdateModeratorReviewDTO(UpdateDTO):
    comment: Optional[str] = None
