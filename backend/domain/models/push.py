from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import ConfigDict

from pydantic import BaseModel

from domain.models import User


class Push(BaseModel):
    id: UUID
    title: str
    text: str
    creator_id: UUID
    image_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    creator: Optional[User] = None

    model_config = ConfigDict(from_attributes=True)
