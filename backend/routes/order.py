import logging
import os
from uuid import UUID

import aiofiles
from fastapi import APIRouter, Request
from fastapi import HTTPException, status, UploadFile, Form, File
from fastapi.responses import JSONResponse

from dependencies.services.order import get_order_service  # Уточните импорт
from domain.dto import UpdateOrderDTO
from domain.dto.order import CreateOrderDTO  # Уточните импорт
from routes.requests.order import UpdateOrderRequest

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)

logger = logging.getLogger(__name__)


@router.get("")
async def get_orders(request: Request):
    order_service = get_order_service()
    orders = await order_service.get_orders()
    return orders


@router.get("/{order_id}")
async def get_order(order_id: UUID, request: Request):
    order_service = get_order_service()
    order = await order_service.get_order(order_id)
    return order


@router.post("")
async def create_order(
        user_id: UUID = Form(...),
        product_id: UUID = Form(...),
        card_number: str = Form(..., min_length=13, max_length=19),
        screenshot: UploadFile = File(...),
):
    # Асинхронно сохраняем файл
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_location = os.path.join(upload_dir, screenshot.filename)
    try:
        async with aiofiles.open(file_location, "wb") as file_obj:
            await file_obj.write(await screenshot.read())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось сохранить файл"
        ) from e

    # Формируем DTO для создания заказа
    dto_data = {
        "user_id": user_id,
        "product_id": product_id,
        "card_number": card_number,
        "screenshot_path": file_location,
    }
    create_order_dto = CreateOrderDTO(**dto_data)

    # Получаем сервис заказов и создаём заказ
    order_service = get_order_service()
    order = await order_service.create_order(create_order_dto)

    return JSONResponse(status_code=status.HTTP_201_CREATED, content=order)


@router.patch("/{order_id}")
async def update_order(order_id: UUID, request: Request, order_req: UpdateOrderRequest):
    order_service = get_order_service()
    dto = UpdateOrderDTO(**order_req.model_dump(exclude_unset=True))
    await order_service.update_order(order_id, dto)
    return {"message": "Order updated successfully"}


@router.delete("/{order_id}")
async def delete_order(order_id: UUID, request: Request):
    order_service = get_order_service()
    await order_service.delete_order(order_id)
    return {"message": "Order deleted successfully"}
