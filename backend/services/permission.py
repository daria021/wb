from dataclasses import dataclass
from uuid import UUID

from abstractions.services import UserServiceInterface
from abstractions.services.permissions import PermissionServiceInterface
from infrastructure.enums.user_role import UserRole
from services.exceptions import PermissionException


@dataclass
class PermissionService(PermissionServiceInterface):
    user_service: UserServiceInterface

    async def is_moderator(self, user_id: UUID) -> None:
        user = await self.user_service.get_user(user_id)
        is_moderator = user.role == UserRole.MODERATOR

        if not is_moderator:
            raise PermissionException("Only moderators can do this")
