from abstractions.repositories.user_history import UserHistoryRepositoryInterface
from dependencies.repositories.session_maker import get_session_maker
from infrastructure.repositories.user_history import UserHistoryRepository


def get_user_history_repository() -> UserHistoryRepositoryInterface:
    return UserHistoryRepository(
        session_maker=get_session_maker()
    )
