from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class Deeplink(BaseModel):
    id: UUID
    url: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @property
    def key(self) -> str:
        return str(self.id)
