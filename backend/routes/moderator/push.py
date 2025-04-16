from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Request, Form, HTTPException

from dependencies.services.upload import get_upload_service
from domain.dto import CreatePushDTO, UpdatePushDTO
from domain.models import Push
from routes.moderator.utils import moderator_pre_request
from routes.requests.push import CreatePushRequest, UpdatePushRequest

router = APIRouter(
    prefix='/pushes'
)


@router.get('')
async def get_pushes(request: Request) -> list[Push]:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.get_pushes()


@router.get('/{push_id}')
async def get_push(
        push_id: UUID,
        request: Request,
) -> Push:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.get_push(push_id)


@router.post('')
async def create_push(
        create_request: Annotated[CreatePushRequest, Form()],
        request: Request,
) -> None:
    moderator_id, moderator_service, _ = await moderator_pre_request(request)

    create_dto = CreatePushDTO(
        title=create_request.title,
        text=create_request.text,
        creator_id=moderator_id,
        button_text=create_request.button_text,
        button_link=create_request.button_link,
    )

    if create_request.image:
        upload_service = get_upload_service()
        try:
            create_dto.image_path = await upload_service.upload(create_request.image)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Не удалось сохранить файл search_query_screenshot"
            ) from e

    await moderator_service.create_push(create_dto)


@router.patch('/{push_id}')
async def update_push(
        request: Request,
        push_id: UUID,
        update_request: Annotated[UpdatePushRequest, Form()],
) -> None:
    moderator_id, moderator_service, _ = await moderator_pre_request(request)

    update_dto = UpdatePushDTO(
        title=update_request.title,
        text=update_request.text,
        button_text=update_request.button_text,
        button_link=update_request.button_link,
    )

    request_dump = update_request.model_dump(exclude_unset=True)
    if image := request_dump.get('image', None):
        upload_service = get_upload_service()
        update_dto.image_path = await upload_service.upload(image)

    await moderator_service.update_push(
        push_id=push_id,
        update_dto=update_dto,
    )


@router.delete('/{push_id}')
async def delete_push(
        request: Request,
        push_id: UUID,
) -> None:
    moderator_id, moderator_service, _ = await moderator_pre_request(request)
    await moderator_service.delete_push(
        push_id=push_id
    )


@router.post('/{push_id}/activate')
async def activate_push(
        push_id: UUID,
        user_ids: list[UUID],
        request: Request,
) -> None:
    moderator_id, moderator_service, _ = await moderator_pre_request(request)

    await moderator_service.activate_push(
        push_id=push_id,
        user_ids=user_ids,
    )
