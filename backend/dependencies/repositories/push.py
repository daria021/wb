from abstractions.repositories.push import PushRepositoryInterface
from dependencies.repositories.session_maker import get_session_maker
from infrastructure.repositories.push import PushRepository


def get_push_repository() -> PushRepositoryInterface:
    return PushRepository(
        session_maker=get_session_maker(),
    )