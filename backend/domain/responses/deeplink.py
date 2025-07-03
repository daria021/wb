from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DeeplinkResponse(BaseModel):
    id: UUID
    url: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
