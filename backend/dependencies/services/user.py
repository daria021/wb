from abstractions.services import UserServiceInterface
from dependencies.repositories.user import get_user_repository
from dependencies.services.notification import get_notification_service
from services.user import UserService
from settings import settings


def get_user_service() -> UserServiceInterface:
    return UserService(
        user_repository=get_user_repository(),
        notification_service=get_notification_service(),
        bot_username=settings.bot.username,
    )
