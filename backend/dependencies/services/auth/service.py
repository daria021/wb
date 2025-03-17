from abstractions.services.auth.service import AuthServiceInterface
from dependencies.services.auth.token import get_token_service
from dependencies.services.user import get_user_service
from services.auth.service import AuthService
from settings import settings


def get_auth_service() -> AuthServiceInterface:
    return AuthService(
        bot_token=settings.bot_token,
        token_service=get_token_service(),
        user_service=get_user_service()
    )
