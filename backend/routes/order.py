import logging
import os
from typing import Optional
from uuid import UUID

import aiofiles
from fastapi import APIRouter, Request
from fastapi import HTTPException, UploadFile, Form, File

from dependencies.services.order import get_order_service  # Уточните импорт
from domain.dto import UpdateOrderDTO
from domain.dto.order import CreateOrderDTO  # Уточните импорт

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
        seller_id: UUID = Form(...),
        search_query_screenshot: UploadFile = File(...),
        cart_screenshot: UploadFile = File(...),
) -> UUID:
    """
    Создаём заказ после шага 1:
    - Сохраняем два скриншота (поискового запроса, корзины).
    - Присваиваем step=1.
    """

    # Подготовим директорию для загрузок
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    # Сохраняем search_query_screenshot
    search_file_location = os.path.join(upload_dir, search_query_screenshot.filename)
    try:
        async with aiofiles.open(search_file_location, "wb") as f:
            content = await search_query_screenshot.read()
            await f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Не удалось сохранить файл search_query_screenshot"
        ) from e

    # Сохраняем cart_screenshot
    cart_file_location = os.path.join(upload_dir, cart_screenshot.filename)
    try:
        async with aiofiles.open(cart_file_location, "wb") as f:
            content = await cart_screenshot.read()
            await f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Не удалось сохранить файл cart_screenshot"
        ) from e

    # Создаём заказ (step=1)
    order_data = CreateOrderDTO(
        user_id=user_id,
        product_id=product_id,
        step=1,
        seller_id=seller_id,
        search_screenshot_path=search_file_location,
        cart_screenshot_path=cart_file_location,
        status="CREATED"
    )

    # Допустим, у вас есть OrderService со методом create_order
    order_service = get_order_service()
    new_order_id = await order_service.create_order(order_data)
    return new_order_id
    # return JSONResponse(status_code=201, content=new_order_id)


@router.patch("/{order_id}")
async def update_order(
        order_id: UUID,
        step: Optional[int] = Form(None),

        # Шаг 4 (реквизиты)
        card_number: Optional[str] = Form(None),
        phone_number: Optional[str] = Form(None),
        name: Optional[str] = Form(None),
        bank: Optional[str] = Form(None),

        # Шаг 5
        final_cart_screenshot: Optional[UploadFile] = File(None),

        # Шаг 6
        delivery_screenshot: Optional[UploadFile] = File(None),
        barcodes_screenshot: Optional[UploadFile] = File(None),

        # Шаг 7
        review_screenshot: Optional[UploadFile] = File(None),
        receipt_screenshot: Optional[UploadFile] = File(None),
        receipt_number: Optional[str] = Form(None),
):
    """
    Универсальное обновление заказа:
    - Меняем step, если он пришёл.
    - Если пришли файлы/поля для конкретного шага — сохраняем их и передаём через DTO.
    """

    # Собираем данные для UpdateOrderDTO в словарь
    update_data = {}

    if step is not None:
        update_data["step"] = step

    # Шаг 4: реквизиты
    if card_number is not None:
        update_data["card_number"] = card_number
    if phone_number is not None:
        update_data["phone_number"] = phone_number
    if name is not None:
        update_data["name"] = name
    if bank is not None:
        update_data["bank"] = bank

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    # Функция-хелпер для сохранения файла (можно вынести отдельно)
    async def save_file_to_disk(file: UploadFile) -> str:
        file_location = os.path.join(upload_dir, file.filename)
        async with aiofiles.open(file_location, "wb") as f:
            content = await file.read()
            await f.write(content)
        return file_location

    # Шаг 5
    if final_cart_screenshot is not None:
        path = await save_file_to_disk(final_cart_screenshot)
        update_data["final_cart_screenshot_path"] = path

    # Шаг 6
    if delivery_screenshot is not None:
        path = await save_file_to_disk(delivery_screenshot)
        update_data["delivery_screenshot_path"] = path

    if barcodes_screenshot is not None:
        path = await save_file_to_disk(barcodes_screenshot)
        update_data["barcodes_screenshot_path"] = path

    # Шаг 7
    if review_screenshot is not None:
        path = await save_file_to_disk(review_screenshot)
        update_data["review_screenshot_path"] = path

    if receipt_screenshot is not None:
        path = await save_file_to_disk(receipt_screenshot)
        update_data["receipt_screenshot_path"] = path

    if receipt_number is not None:
        update_data["receipt_number"] = receipt_number

    # Создаём DTO на основе собранных полей
    dto = UpdateOrderDTO.model_validate(update_data)

    # Вызываем метод сервиса для обновления
    order_service = get_order_service()
    await order_service.update_order(order_id, dto)

    # if not updated_order:
    #     raise HTTPException(status_code=404, detail="Order not found")

    return {"message": "Order updated successfully"}


@router.delete("/{order_id}")
async def delete_order(order_id: UUID, request: Request):
    order_service = get_order_service()
    await order_service.delete_order(order_id)
    return {"message": "Order deleted successfully"}
