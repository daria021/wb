from abc import ABC
from uuid import UUID

from abstractions.repositories import CRUDRepositoryInterface
from domain.dto.user_history import CreateUserHistoryDTO, UpdateUserHistoryDTO
from infrastructure.entities import UserHistory


class UserHistoryRepositoryInterface(
    CRUDRepositoryInterface[UserHistory, CreateUserHistoryDTO, UpdateUserHistoryDTO],
    ABC,
):
    async def get_by_user(self, user_id: UUID) -> list[UserHistory]:
        ...
