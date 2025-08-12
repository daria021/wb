import random
import string
from dataclasses import dataclass
from typing import List
from uuid import UUID

from fastapi import HTTPException, status

from abstractions.repositories import OrderRepositoryInterface, ProductRepositoryInterface, UserRepositoryInterface
from abstractions.services import OrderServiceInterface
from abstractions.services.notification import NotificationServiceInterface
from domain.dto import UpdateOrderDTO, CreateOrderDTO, UpdateUserDTO, UpdateProductDTO
from domain.models import Order
from domain.responses.order_report import OrderReport
from infrastructure.enums.order_status import OrderStatus
from infrastructure.enums.product_status import ProductStatus
from infrastructure.enums.user_role import UserRole


@dataclass
class OrderService(OrderServiceInterface):
    order_repository: OrderRepositoryInterface
    product_repository: ProductRepositoryInterface
    notification_service: NotificationServiceInterface
    user_repository: UserRepositoryInterface

    async def create_order(self, dto: CreateOrderDTO) -> UUID:
        # 1. Проверяем, что товар есть в наличии
        product = await self.product_repository.get(dto.product_id)
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

        # 2. патчим заказ
        await self.order_repository.update(order_id, dto)

        # 3. читаем свежее состояние
        order = await self.order_repository.get(order_id)
        product = await self.product_repository.get(order.product_id)
        seller = await self.user_repository.get(product.seller_id)

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
