from abstractions.services.notification import NotificationServiceInterface
from dependencies.repositories.order import get_order_repository
from dependencies.repositories.product import get_product_repository
from dependencies.repositories.push import get_push_repository
from dependencies.repositories.user import get_user_repository
from dependencies.repositories.user_push import get_user_push_repository
from dependencies.services.deeplink import get_deeplink_service
from dependencies.services.upload import get_upload_service
from services.notifications import NotificationService
from settings import settings


def get_notification_service() -> NotificationServiceInterface:
    return NotificationService(
        users_repository=get_user_repository(),
        orders_repository=get_order_repository(),
        push_repository=get_push_repository(),
        user_push_repository=get_user_push_repository(),
        products_repository=get_product_repository(),
        upload_service=get_upload_service(),
        bot_token=settings.bot.token,
        deeplink_service=get_deeplink_service(),
    )
