from uuid import UUID

from fastapi import APIRouter, Request

from dependencies.services.product import get_product_service
from dependencies.services.user import get_user_service
from domain.models import Product
from routes.utils import get_user_id_from_request

router = APIRouter(
    prefix="/products",
)


@router.get("")
async def get_products_by_user(request: Request) -> list[Product]:
    user_id = get_user_id_from_request(request)
    user_service = get_user_service()
    return await user_service.get_products_by_user(user_id)
