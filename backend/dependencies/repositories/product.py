from abstractions.repositories import ProductRepositoryInterface
from dependencies.repositories.session_maker import get_session_maker
from infrastructure.repositories.product import ProductRepository


def get_product_repository() -> ProductRepositoryInterface:
    return ProductRepository(
        session_maker=get_session_maker()
    )