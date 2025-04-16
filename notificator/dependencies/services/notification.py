from abstractions.services.notification import NotificationServiceInterface
from dependencies.repositories.user_push import get_user_push_repository
from services.notification import Notificator
from settings import settings


def get_notificator() -> NotificationServiceInterface:
    return Notificator(
        token=settings.bot.token,
        notifications_repository=get_user_push_repository(),
    )
