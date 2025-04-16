from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional
from uuid import UUID

from abstractions.repositories import CRUDRepositoryInterface
from domain.dto.user_push import CreateUserPushDTO, UpdateUserPushDTO
from domain.models.user_push import UserPush
from infrastructure.enums.push_status import PushStatus


class UserPushRepositoryInterface(
    CRUDRepositoryInterface[UserPush, CreateUserPushDTO, UpdateUserPushDTO],
    ABC,
):
    @abstractmethod
    async def get_queued_pushes(self, size: int = 10) -> list[UserPush]:
        ...

    @abstractmethod
    async def set_status(self, user_push_id: UUID, status: PushStatus, sent_at: Optional[datetime] = None):
        ...
