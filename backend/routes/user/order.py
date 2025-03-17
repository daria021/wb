from uuid import UUID

from fastapi import APIRouter, Request

from dependencies.services.order import get_order_service
from domain.models import Order
from routes.utils import get_user_id_from_request

router = APIRouter(
    prefix="/orders",
)


@router.get("")
async def get_orders_by_user(request: Request) -> list[Order]:
    user_id = get_user_id_from_request(request)
    order_service = get_order_service()
    return await order_service.get_orders_by_user(user_id)



