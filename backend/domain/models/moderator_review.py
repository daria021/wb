from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from infrastructure.enums.product_status import ProductStatus


class ModeratorReview(BaseModel):
    id: UUID
    moderator_id: UUID
    product_id: UUID
    comment: str
    status_before: ProductStatus
    status_after: ProductStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
