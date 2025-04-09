from uuid import UUID

from fastapi import APIRouter, Request

from abstractions.services.moderator import ModeratorServiceInterface
from abstractions.services.permissions import PermissionServiceInterface
from dependencies.services.moderator import get_moderator_service
from dependencies.services.permissions import get_permission_service
from domain.models import User
from routes.moderator.utils import moderator_pre_request
from routes.utils import get_user_id_from_request

router = APIRouter(
    prefix='/users',
)

@router.get('')
async def get_users(
        request: Request,
) -> list[User]:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.get_users()


@router.get('/moderators')
async def get_moderators(
        request: Request,
) -> list[User]:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.get_moderators()


@router.get('/sellers')
async def get_sellers(
        request: Request,
) -> list[User]:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.get_sellers()

@router.get('/clients')
async def get_clients(
        request: Request,
) -> list[User]:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.get_clients()


@router.get('/banned')
async def get_banned_users(
        request: Request,
) -> list[User]:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.get_banned()


@router.get('/{user_id}')
async def get_user(
        request: Request,
        user_id: UUID,
) -> User:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.get_user(user_id)


@router.post('/{user_id}/ban')
async def ban_user(
        request: Request,
        user_id: UUID,

) -> None:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.ban_user(user_id)


@router.post('/{user_id}/unban')
async def unban_user(
        request: Request,
        user_id: UUID,

) -> None:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.unban_user(user_id)


@router.post('/{user_id}/promote')
async def promote_user(
        request: Request,
        user_id: UUID,

) -> None:
    moderator_id, moderator_service, permission_service = await moderator_pre_request(request)

    await permission_service.is_admin(moderator_id)

    return await moderator_service.promote_user(user_id)


@router.post('/{user_id}/demote')
async def demote_user(
        request: Request,
        user_id: UUID,

) -> None:
    moderator_id, moderator_service, permission_service = await moderator_pre_request(request)

    await permission_service.is_admin(moderator_id)

    return await moderator_service.demote_user(user_id)
