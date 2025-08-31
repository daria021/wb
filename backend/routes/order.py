import logging
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Request, Depends
from fastapi import HTTPException, UploadFile, Form, File

from abstractions.services.upload import UploadServiceInterface
from dependencies.services.order import get_order_service
from dependencies.services.upload import get_upload_service
from domain.dto import UpdateOrderDTO
from domain.dto.order import CreateOrderDTO
from infrastructure.enums.order_status import OrderStatus
from dependencies.services.notification import get_notification_service

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
        # search_query_screenshot: UploadFile = File(...),
        # cart_screenshot: UploadFile = File(...),
        upload_service: UploadServiceInterface = Depends(get_upload_service),
) -> UUID:
    # Создаём заказ (step=1)
    order_data = CreateOrderDTO(
        user_id=user_id,
        product_id=product_id,
        step=0,
        seller_id=seller_id,
        status=OrderStatus.CASHBACK_NOT_PAID,
    )

    # Допустим, у вас есть OrderService со методом create_order
    order_service = get_order_service()
    new_order_id = await order_service.create_order(order_data)
    return new_order_id


@router.patch("/status/{order_id}")
async def update_order_status(
        order_id: UUID,
        status: OrderStatus = Form(...),
):
    update_data = {}
    if status is not None:
        update_data["status"] = status

    # Создаём DTO на основе собранных полей
    dto = UpdateOrderDTO.model_validate(update_data)
    order_service = get_order_service()

    await order_service.update_order(order_id, dto)

    # if not updated_order:
    #     raise HTTPException(status_code=404, detail="Order not found")

    # return {"message": "Order updated successfully"}


@router.patch("/{order_id}")
async def update_order(
        order_id: UUID,
        step: Optional[int] = Form(None),

        # Шаг 1
        search_screenshot_path: Optional[UploadFile] = File(None),
        cart_screenshot_path: Optional[UploadFile] = File(None),

        # Шаг 4 (реквизиты)
        card_number: Optional[str] = Form(None),
        phone_number: Optional[str] = Form(None),
        name: Optional[str] = Form(None),
        bank: Optional[str] = Form(None),

        # Шаг 5
        final_cart_screenshot_path: Optional[UploadFile] = File(None),

        # Шаг 6
        delivery_screenshot: Optional[UploadFile] = File(None),
        barcodes_screenshot: Optional[UploadFile] = File(None),

        # Шаг 7
        review_screenshot: Optional[UploadFile] = File(None),
        receipt_screenshot: Optional[UploadFile] = File(None),
        receipt_number: Optional[str] = Form(None),
        order_date: Optional[datetime] = Form(None),
        upload_service: UploadServiceInterface = Depends(get_upload_service),
):
    # Собираем данные для UpdateOrderDTO в словарь
    update_data = {}

    if step is not None:
        update_data["step"] = step

    # Шаг 1
    if search_screenshot_path is not None:
        path = await upload_service.upload(search_screenshot_path)
        update_data["search_screenshot_path"] = path
    if cart_screenshot_path is not None:
        path = await upload_service.upload(cart_screenshot_path)
        update_data["cart_screenshot_path"] = path

    logger.info('ФАЙЛЫ')
    logger.info(search_screenshot_path)
    logger.info(cart_screenshot_path)

    # Шаг 4: реквизиты
    if card_number is not None:
        update_data["card_number"] = card_number
    if phone_number is not None:
        update_data["phone_number"] = phone_number
    if name is not None:
        update_data["name"] = name
    if bank is not None:
        update_data["bank"] = bank

    # Шаг 5
    if final_cart_screenshot_path is not None:
        path = await upload_service.upload(final_cart_screenshot_path)
        update_data["final_cart_screenshot_path"] = path

    # Шаг 6
    if delivery_screenshot is not None:
        path = await upload_service.upload(delivery_screenshot)
        update_data["delivery_screenshot_path"] = path

    if barcodes_screenshot is not None:
        path = await upload_service.upload(barcodes_screenshot)
        update_data["barcodes_screenshot_path"] = path

    # Шаг 7
    if review_screenshot is not None:
        path = await upload_service.upload(review_screenshot)
        update_data["review_screenshot_path"] = path

    if receipt_screenshot is not None:
        path = await upload_service.upload(receipt_screenshot)
        update_data["receipt_screenshot_path"] = path

    if receipt_number is not None:
        update_data["receipt_number"] = receipt_number

    if order_date is not None:
        update_data["order_date"] = order_date

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


@router.post("/inactivity/trigger")
async def trigger_inactivity_check():
    """Ручной запуск проверки неактивных заказов и рассылки напоминаний/отмены."""
    order_service = get_order_service()
    notification_service = get_notification_service()

    from datetime import datetime, timedelta
    from domain.dto import UpdateOrderDTO
    from infrastructure.enums.order_status import OrderStatus
    from dependencies.repositories.user_history import get_user_history_repository
    from domain.dto.user_history import CreateUserHistoryDTO
    from infrastructure.enums.action import Action

    repo = order_service.order_repository
    now = datetime.now()

    # 1) Напоминания для 3+ дней без движения (step==0)
    for order in await repo.get_inactive_orders(now - timedelta(days=3)):
        await notification_service.send_order_progress_reminder(order.user_id, order.id)
        try:
            user_history_repository = get_user_history_repository()
            await user_history_repository.create(CreateUserHistoryDTO(
                user_id=order.user_id,
                creator_id=None,
                product_id=order.product_id,
                action=Action.REMINDER_SENT,
                date=now,
                json_before=None,
                json_after=None,
            ))
        except Exception:
            # необязательная запись
            pass

    # 2) Отмена для 4+ дней без движения
    for order in await repo.get_inactive_after_reminder(now - timedelta(days=4)):
        await order_service.update_order(order.id, UpdateOrderDTO(status=OrderStatus.CANCELLED))

    return {"ok": True}
