from fastapi import APIRouter

from dependencies.services.auth.service import get_auth_service
from routes.requests.auth import TelegramAuthRequest

router = APIRouter(
    prefix='/auth',
    tags=['Auth'],
)


@router.post("/telegram")
async def telegram_auth(payload: TelegramAuthRequest):
    auth_service = get_auth_service()

    tokens = await auth_service.create_token(payload.initData)

    return tokens
