from pydantic import BaseModel, ConfigDict


class DeeplinkResponse(BaseModel):
    id: str
    url: str
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)
