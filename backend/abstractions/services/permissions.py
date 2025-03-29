from abc import ABC, abstractmethod
from uuid import UUID


class PermissionServiceInterface(ABC):
    @abstractmethod
    async def is_moderator(self, user_id: UUID) -> None:
        ...
