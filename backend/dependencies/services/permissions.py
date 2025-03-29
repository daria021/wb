from abstractions.services.permissions import PermissionServiceInterface
from dependencies.services.user import get_user_service
from services.permission import PermissionService


def get_permission_service() -> PermissionServiceInterface:
    return PermissionService(
        user_service=get_user_service(),
    )
