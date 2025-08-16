from abstractions.services import ProductServiceInterface
from abstractions.services.notification import NotificationServiceInterface
from dependencies.repositories.product import get_product_repository
from dependencies.repositories.push import get_push_repository
from dependencies.repositories.user import get_user_repository
from dependencies.repositories.user_history import get_user_history_repository
from dependencies.repositories.user_push import get_user_push_repository
from dependencies.services.notification import get_notification_service
from services.product import ProductService


def get_product_service() -> ProductServiceInterface:
    return ProductService(
        product_repository=get_product_repository(),
        user_repository=get_user_repository(),
        push_repository=get_push_repository(),
        user_push_repository=get_user_push_repository(),
        notification_service=get_notification_service(),
        user_history_repository=get_user_history_repository()

    )
