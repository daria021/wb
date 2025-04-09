from typing import Optional

from fastapi import UploadFile
from pydantic import BaseModel


class CreatePushRequest(BaseModel):
    title: str
    text: str
    image: Optional[UploadFile] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None


class UpdatePushRequest(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    image: Optional[UploadFile] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
