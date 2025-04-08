from uuid import UUID

from fastapi import Request

from abstractions.services.moderator import ModeratorServiceInterface
from abstractions.services.permissions import PermissionServiceInterface
from dependencies.services.moderator import get_moderator_service
from dependencies.services.permissions import get_permission_service
from routes.utils import get_user_id_from_request


async def moderator_pre_request(request: Request) -> tuple[UUID, ModeratorServiceInterface, PermissionServiceInterface]:
    permission_service = get_permission_service()

    moderator_id = get_user_id_from_request(request)

    await permission_service.is_moderator(moderator_id)

    return moderator_id, get_moderator_service(), permission_service
