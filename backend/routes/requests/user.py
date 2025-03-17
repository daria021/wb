from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class CreateUserRequest(BaseModel):
    telegram_id: Optional[int] = Field(None, description="Telegram ID пользователя")
    nickname: Optional[str] = Field(None, description="Ник пользователя")
    email: EmailStr = Field(..., description="Email пользователя")
    password: str = Field(..., min_length=6, description="Пароль пользователя")

class UpdateUserRequest(BaseModel):
    nickname: Optional[str] = Field(None, description="Новое имя или ник пользователя")
    email: Optional[EmailStr] = Field(None, description="Новый email пользователя")
    password: Optional[str] = Field(None, min_length=6, description="Новый пароль пользователя")
