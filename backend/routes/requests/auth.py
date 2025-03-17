from pydantic import BaseModel


class TelegramAuthRequest(BaseModel):
    initData: str
