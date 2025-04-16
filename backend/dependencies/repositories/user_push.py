from abstractions.repositories.user_push import UserPushRepositoryInterface
from dependencies.repositories.session_maker import get_session_maker
from infrastructure.repositories.user_push import UserPushRepository


def get_user_push_repository() -> UserPushRepositoryInterface:
    return UserPushRepository(
        session_maker=get_session_maker(),
    )
