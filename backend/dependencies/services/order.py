from abstractions.services import OrderServiceInterface
from dependencies.repositories.order import get_order_repository
from dependencies.repositories.product import get_product_repository
from dependencies.repositories.user_history import get_user_history_repository
from dependencies.services.notification import get_notification_service
from dependencies.repositories.user import get_user_repository
from services.order import OrderService


def get_order_service() -> OrderServiceInterface:
    return OrderService(
        order_repository=get_order_repository(),
        product_repository=get_product_repository(),
        notification_service=get_notification_service(),
        user_repository=get_user_repository(),
        user_history_repository=get_user_history_repository()
    )
