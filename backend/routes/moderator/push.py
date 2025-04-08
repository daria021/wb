from uuid import UUID

from fastapi import APIRouter, Request

from domain.dto import CreatePushDTO
from domain.models import Push
from routes.moderator.utils import moderator_pre_request
from routes.requests.push import CreatePushRequest

router = APIRouter(
    prefix='/push'
)


@router.get('')
async def get_pushes(request: Request) -> list[Push]:
    _, moderator_service, _ = moderator_pre_request(request)

    return await moderator_service.get_pushes()


@router.get('/{push_id}')
async def get_push(
        push_id: UUID,
        request: Request,
) -> Push:
    _, moderator_service, _ = moderator_pre_request(request)

    return await moderator_service.get_push(push_id)


@router.post('')
async def create_push(
        create_dto: CreatePushRequest,
        request: Request,
) -> None:
    moderator_id, moderator_service, _ = moderator_pre_request(request)
    create_dto = CreatePushDTO(
        title=create_dto.title,
        text=create_dto.text,
        creator_id=moderator_id,
        image_path=create_dto.image_path,
    )
    await moderator_service.create_push(create_dto)


@router.post('/{push_id}/activate')
async def activate_push(
        push_id: UUID,
        user_ids: list[UUID],
        request: Request,
) -> None:
    moderator_id, moderator_service, _ = moderator_pre_request(request)

    await moderator_service.activate_push(
        push_id=push_id,
        user_ids=user_ids,
    )
