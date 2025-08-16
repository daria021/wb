from abstractions.repositories.increasing_balance import IncreasingBalanceRepositoryInterface
from dependencies.repositories.session_maker import get_session_maker
from infrastructure.repositories.increasing_balance import IncreasingBalanceRepository


def get_increasing_balance_repository() -> IncreasingBalanceRepositoryInterface:
    return IncreasingBalanceRepository(
        session_maker=get_session_maker()
    )