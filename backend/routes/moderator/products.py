from uuid import UUID

from fastapi import APIRouter, Request

from domain.models import Product
from routes.moderator.utils import moderator_pre_request
from routes.requests.moderator import UpdateProductStatusRequest

router = APIRouter(
    prefix='/products',
)

@router.get('')
async def get_products(
        request: Request,
) -> list[Product]:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.get_products()


@router.get('/to-review')
async def get_products_to_review(
        request: Request,
) -> list[Product]:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.get_products_to_review()


@router.get('/{product_id}')
async def get_product(
        request: Request,
        product_id: UUID,
) -> Product:
    _, moderator_service, _ = await moderator_pre_request(request)

    return await moderator_service.get_product(product_id)


@router.patch('/{product_id}')
async def review_product(
        request: Request,
        product_id: UUID,
        update_request: UpdateProductStatusRequest,
) -> None:
    moderator_id, moderator_service, _ = await moderator_pre_request(request)

    await moderator_service.review_product(
        product_id=product_id,
        moderator_id=moderator_id,
        request=update_request,
    )
