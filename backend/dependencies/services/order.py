from abstractions.services import OrderServiceInterface
from dependencies.repositories.order import get_order_repository
from dependencies.repositories.product import get_product_repository
from services.order import OrderService


def get_order_service() -> OrderServiceInterface:
    return OrderService(
        order_repository=get_order_repository(),
        product_repository=get_product_repository()
    )