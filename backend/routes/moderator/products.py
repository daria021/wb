from uuid import UUID

from fastapi import APIRouter, Request

from abstractions.services.moderator import ModeratorServiceInterface
from dependencies.services.moderator import get_moderator_service
from dependencies.services.permissions import get_permission_service
from domain.models import Product
from routes.requests.moderator import UpdateProductStatusRequest
from routes.utils import get_user_id_from_request

router = APIRouter(
    prefix='/products',
)


async def moderator_pre_request(request: Request) -> tuple[UUID, ModeratorServiceInterface]:
    permission_service = get_permission_service()

    moderator_id = get_user_id_from_request(request)

    await permission_service.is_moderator(moderator_id)

    return moderator_id, get_moderator_service()


@router.get('')
async def get_products(
        request: Request,
) -> list[Product]:
    _, moderator_service = await moderator_pre_request(request)

    return await moderator_service.get_products()


@router.get('/to-review')
async def get_products_to_review(
        request: Request,
) -> list[Product]:
    _, moderator_service = await moderator_pre_request(request)

    return await moderator_service.get_products_to_review()


@router.get('/{product_id}')
async def get_product(
        request: Request,
        product_id: UUID,
) -> Product:
    _, moderator_service = await moderator_pre_request(request)

    return await moderator_service.get_product(product_id)


@router.patch('/{product_id}')
async def review_product(
        request: Request,
        product_id: UUID,
        update_request: UpdateProductStatusRequest,
) -> None:
    moderator_id, moderator_service = await moderator_pre_request(request)

    await moderator_service.review_product(
        product_id=product_id,
        moderator_id=moderator_id,
        request=update_request,
    )
