import logging
import random
import string
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List
from uuid import UUID

from fastapi import HTTPException, status

from abstractions.repositories import OrderRepositoryInterface, ProductRepositoryInterface, UserRepositoryInterface
from abstractions.services import OrderServiceInterface
from abstractions.services.notification import NotificationServiceInterface
from dependencies.repositories.user_history import get_user_history_repository
from domain.dto import UpdateOrderDTO, CreateOrderDTO, UpdateUserDTO, UpdateProductDTO
from domain.dto.user_history import CreateUserHistoryDTO
from domain.models import Order
from domain.responses.order_report import OrderReport
from infrastructure.enums.action import Action
from infrastructure.enums.order_status import OrderStatus
from infrastructure.enums.product_status import ProductStatus
from infrastructure.enums.user_role import UserRole
from settings import settings

logger = logging.getLogger(__name__)

@dataclass
class OrderService(OrderServiceInterface):
    order_repository: OrderRepositoryInterface
    product_repository: ProductRepositoryInterface
    notification_service: NotificationServiceInterface
    user_repository: UserRepositoryInterface

    async def create_order(self, dto: CreateOrderDTO) -> UUID:
        # 1. Проверяем, что товар есть в наличии
        product = await self.product_repository.get(dto.product_id)
        now = datetime.now()

        # +++ снимок "до"
        json_before = product.model_dump(mode="json")
        old_status = product.status

        if product.remaining_products <= 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Товар закончился"
            )

        # 2. Генерируем уникальный 6-значный код сделки
        dto.transaction_code =  await self.generate_unique_code()

        # 3. Создаём заказ (в базе сохранится и код)
        await self.order_repository.create(dto)

        # 4. Списываем единицу со склада
        new_remaining = product.remaining_products - 1
        await self.product_repository.update(
            product.id,
            UpdateProductDTO(
                remaining_products=new_remaining,
                status=(
                    ProductStatus.ARCHIVED
                    if new_remaining == 0
                    else product.status
                )
            )
        )
        user_history_repository = get_user_history_repository()


        if dto.step == 0:
            await user_history_repository.create(CreateUserHistoryDTO(
                user_id=dto.user_id,
                creator_id=dto.user_id,
                product_id=product.id,
                action=Action.AGREE_TERMS,
                date=now,
                json_before=json_before,
            ))
        # +++ если товар закончился — логируем ENDED и STATUS_CHANGED от имени системы
        if new_remaining == 0:
            updated = await self.product_repository.get(product.id)
            json_after = updated.model_dump(mode="json")


            # 1) Товар закончился
            await user_history_repository.create(CreateUserHistoryDTO(
                user_id=dto.seller_id,
                creator_id=None,
                product_id=product.id,
                action=Action.ENDED,
                date=now,
                json_before=json_before,
                json_after=json_after,
            ))

            # 2) Статус поменялся на ARCHIVED — фиксируем смену статуса (проверяем факт изменения)
            if updated.status != old_status:
                await user_history_repository.create(CreateUserHistoryDTO(
                    user_id=dto.seller_id,
                    creator_id=None,
                    product_id=product.id,
                    action=Action.STATUS_CHANGED,
                    date=now,
                    json_before=json_before,
                    json_after=json_after,
                ))

        # 5. Возвращаем код для пользователя
        return dto.id

    async def generate_unique_code(self) -> str:
        while True:
            code = ''.join(random.choices(string.digits + string.ascii_uppercase, k=6))
            exists = await self.order_repository.exists_by_code(code)
            if not exists:
                return code

    async def get_order(self, order_id: UUID) -> Order:
        return await self.order_repository.get(order_id)

    async def update_order(self, order_id: UUID, dto: UpdateOrderDTO) -> None:
        # 1. прежний статус (нужен для обработки отмены)
        old_order = await self.order_repository.get(order_id)
        old_status = old_order.status

        json_before_order = old_order.model_dump(mode="json")

        # 2. патчим заказ
        await self.order_repository.update(order_id, dto)

        # 3. читаем свежее состояние
        order = await self.order_repository.get(order_id)
        product = await self.product_repository.get(order.product_id)
        seller = await self.user_repository.get(product.seller_id)

        json_after_order = order.model_dump(mode="json")
        now = datetime.now()

        user_history_repository = get_user_history_repository()
        # +++ шаги 1–7
        logger.info(f"debug: {dto.step} {dto.step is not None} {dto.step != old_order.step}")
        if dto.step is not None and dto.step != old_order.step:
            step_to_action = {
                1: Action.FIRST_STEP_DONE,
                2: Action.SECOND_STEP_DONE,
                3: Action.THIRD_STEP_DONE,
                4: Action.FOURTH_STEP_DONE,
                5: Action.FIFTH_STEP_DONE,
                6: Action.SIXTH_STEP_DONE,
                7: Action.SEVENTH_STEP_DONE,
            }
            action = step_to_action.get(dto.step)
            logger.info(f"action: {action}")
            if action is not None:
                await user_history_repository.create(
                    CreateUserHistoryDTO(
                        user_id=order.user_id,
                        creator_id=order.user_id,
                        product_id=order.product_id,
                        action=action,
                        date=now,
                        json_before=json_before_order,
                        json_after=json_after_order,
                    )
                )

        # ---------- переход в CANCELLED ----------
        if dto.status == OrderStatus.CANCELLED and old_status != OrderStatus.CANCELLED:
            new_remaining = product.remaining_products + 1

            # если карточка была в архиве и теперь есть остаток – снова активируем
            new_status = (
                ProductStatus.ACTIVE
                if product.status == ProductStatus.ARCHIVED and new_remaining > 0
                else product.status
            )

            await self.product_repository.update(
                product.id,
                UpdateProductDTO(
                    remaining_products=new_remaining,
                    status=new_status
                )
            )

        # ---------- шаг 5: повышаем продавца ----------
        if dto.step == 5 and seller.role in {UserRole.CLIENT, UserRole.USER}:
            await self.user_repository.update(
                seller.id,
                UpdateUserDTO(role=UserRole.SELLER)
            )

        # ---------- CASHBACK_PAID ----------
        if dto.status == OrderStatus.CASHBACK_PAID:
            await self.notification_service.send_cashback_paid(order_id)
            await self.user_repository.update(
                order.user_id,
                UpdateUserDTO(role=UserRole.CLIENT)
            )
        if dto.status == OrderStatus.CASHBACK_REJECTED:
            await self.notification_service.send_cashback_rejected(order_id)
            await self.user_repository.update(
                order.user_id,
                UpdateUserDTO(role=UserRole.CLIENT)
            )

        user_history_repository = get_user_history_repository()

        # +++ кэшбэк выплачен
        if dto.status == OrderStatus.CASHBACK_PAID and old_status != OrderStatus.CASHBACK_PAID:
            await user_history_repository.create(
                CreateUserHistoryDTO(
                    user_id=order.user_id,
                    creator_id=order.seller_id,  # системное событие
                    product_id=order.product_id,
                    action=Action.CASHBACK_DONE,
                    date=now,
                    json_before=json_before_order,
                    json_after=json_after_order,
                )
            )

        # +++ кэшбэк отклонён
        if dto.status == OrderStatus.CASHBACK_REJECTED and old_status != OrderStatus.CASHBACK_REJECTED:

            await user_history_repository.create(
                CreateUserHistoryDTO(
                    user_id=order.user_id,
                    creator_id=order.seller_id,  # системное событие
                    product_id=order.product_id,
                    action=Action.CASHBACK_REJECTED,
                    date=now,
                    json_before=json_before_order,
                    json_after=json_after_order,
                )
            )

    async def delete_order(self, order_id: UUID) -> None:
        await self.order_repository.delete(order_id)

    async def get_orders(self, limit: int = 100, offset: int = 0) -> List[Order]:
        return await self.order_repository.get_all(limit=limit, offset=offset)

    async def get_orders_by_user(self, user_id: UUID) -> List[Order]:
        return await self.order_repository.get_orders_by_user(user_id=user_id)

    async def get_user_report(self, order_id: UUID) -> OrderReport:
        order = await self.order_repository.get(order_id)
        product = await self.product_repository.get(order.product_id)
        order_dict = order.model_dump()
        order_dict['article'] = product.article
        order_dict['cashback'] = product.wb_price - product.price
        order_report = OrderReport.model_validate(order_dict)
        return order_report

    async def get_orders_by_seller(self, seller_id: UUID) -> list[Order]:
        orders = await self.order_repository.get_orders_by_seller(seller_id)
        return orders
