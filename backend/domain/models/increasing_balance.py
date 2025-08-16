from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from infrastructure.enums.product_status import ProductStatus


class IncreasingBalance(BaseModel):
    id: UUID
    user_id: UUID
    sum: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
