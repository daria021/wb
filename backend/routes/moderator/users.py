import logging
from typing import List
from uuid import UUID

from fastapi import APIRouter, Request

from domain.models import User
from domain.models.moderator_review import ModeratorReview
from routes.moderator.utils import moderator_pre_request

router = APIRouter(
    prefix='/users',
)

logger = logging.getLogger(__name__)

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

    res = await moderator_service.get_user(user_id)
    logger.info(f'inviter {res.inviter}')
    return res

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

@router.post('/{user_id}/use-discount')
async def use_discount_user(
        request: Request,
        user_id: UUID,
) -> None:
    moderator_id, moderator_service, permission_service = await moderator_pre_request(request)

    await permission_service.is_moderator(moderator_id)

    return await moderator_service.use_discount(user_id)


@router.post('/{user_id}/referral-purchase')
async def referral_purchase(
        request: Request,
        user_id: UUID,
        amount: int,
) -> None:
    moderator_id, moderator_service, permission_service = await moderator_pre_request(request)

    await permission_service.is_moderator(moderator_id)

    return await moderator_service.increase_referrer_bonus(user_id, amount)


@router.get('/reviews/{user_id}')
async def get_reviews_by_user(
        request: Request,
        user_id: UUID) -> List[ModeratorReview]:
    moderator_id, moderator_service, permission_service = await moderator_pre_request(request)

    await permission_service.is_moderator(moderator_id)

    return await moderator_service.get_moderator_reviews_by_user(user_id)
