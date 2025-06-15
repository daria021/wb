from abstractions.repositories.deeplink import DeeplinkRepositoryInterface
from dependencies.repositories.session_maker import get_session_maker
from infrastructure.repositories.deeplink import DeeplinkRepository


def get_deeplink_repository() -> DeeplinkRepositoryInterface:
    return DeeplinkRepository(
        session_maker=get_session_maker()
    )
