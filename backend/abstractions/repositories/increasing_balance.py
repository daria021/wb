from abc import ABC
from typing import Optional
from uuid import UUID

from abstractions.repositories import CRUDRepositoryInterface
from domain.dto.increasing_balance import CreateIncreasingBalanceDTO, UpdateIncreasingBalanceDTO
from infrastructure.entities import IncreasingBalance


class IncreasingBalanceRepositoryInterface(
    CRUDRepositoryInterface[IncreasingBalance, CreateIncreasingBalanceDTO, UpdateIncreasingBalanceDTO],
    ABC,
):
    async def get_balance_history_by_user(self, user_id: UUID) -> Optional[list[IncreasingBalance]]:
        ...
