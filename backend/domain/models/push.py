from typing import Optional
from uuid import UUID
from pydantic import ConfigDict

from pydantic import BaseModel

from domain.models import User


class Push(BaseModel):
    title: str
    text: str
    creator_id: UUID
    image_path: Optional[str]
    creator: User
    model_config = ConfigDict(from_attributes=True)
