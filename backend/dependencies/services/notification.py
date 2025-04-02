from abstractions.services.notification import NotificationServiceInterface
from dependencies.repositories.order import get_order_repository
from dependencies.repositories.user import get_user_repository
from services.notifications import NotificationService
from settings import settings


def get_notification_service() -> NotificationServiceInterface:
    return NotificationService(
        token=settings.bot.token,
        users_repository=get_user_repository(),
        orders_repository=get_order_repository(),
    )
