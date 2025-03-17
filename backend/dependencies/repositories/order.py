from abstractions.repositories import OrderRepositoryInterface
from dependencies.repositories.session_maker import get_session_maker
from infrastructure.repositories.order import OrderRepository


def get_order_repository() -> OrderRepositoryInterface:
    return OrderRepository(
        session_maker=get_session_maker()
    )