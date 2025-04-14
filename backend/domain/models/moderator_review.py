from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from infrastructure.enums.product_status import ProductStatus


class ModeratorReview(BaseModel):
    id: UUID
    moderator_id: UUID
    comment_to_seller: Optional[str] = None
    comment_to_moderator: Optional[str] = None
    product_id: UUID
    status_before: ProductStatus
    status_after: ProductStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
