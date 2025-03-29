from abstractions.services import ProductServiceInterface
from dependencies.repositories.product import get_product_repository
from dependencies.repositories.user import get_user_repository
from services.product import ProductService


def get_product_service() -> ProductServiceInterface:
    return ProductService(
        product_repository=get_product_repository(),
        user_repository=get_user_repository(),
    )
