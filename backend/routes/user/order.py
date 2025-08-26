from uuid import UUID

from fastapi import APIRouter, Request

from dependencies.services.order import get_order_service
from domain.models import Order
from domain.responses.order_report import OrderReport
from routes.utils import get_user_id_from_request

router = APIRouter(
    prefix="/orders",
)


@router.get("")
async def get_orders_by_user(request: Request) -> list[Order]:
    user_id = get_user_id_from_request(request)
    order_service = get_order_service()
    return await order_service.get_orders_by_user(user_id)


@router.get("/reports/{seller_id}")
async def get_orders_by_seller(request: Request, seller_id: UUID) -> list[Order]:
    order_service = get_order_service()
    return await order_service.get_orders_by_seller(seller_id)

@router.get("/all/reports/{seller_id}")
async def get_all_orders_by_seller(request: Request, seller_id: UUID) -> list[Order]:
    order_service = get_order_service()
    return await order_service.get_all_orders_by_seller(seller_id)

@router.get("/report/{order_id}")
async def get_user_report(request: Request, order_id: UUID) -> OrderReport:
    order_service = get_order_service()
    return await order_service.get_user_report(order_id)

