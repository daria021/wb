from dataclasses import field, dataclass
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from abstractions.repositories import OrderRepositoryInterface
from domain.dto import CreateOrderDTO, UpdateOrderDTO
from domain.models import Order, Product as ProductModel, User
from domain.models import User as UserModel
from domain.models.order import Order as OrderModel
from domain.responses.order_report import OrderReport
from infrastructure.entities import Order, Product
from infrastructure.enums.order_status import OrderStatus
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository


@dataclass
class OrderRepository(
    AbstractSQLAlchemyRepository[Order, OrderModel, CreateOrderDTO, UpdateOrderDTO],
    OrderRepositoryInterface,
):
    joined_fields: dict[str, Optional[list[str]]] = field(default_factory=lambda: {
        'product': None,
        'user': None
    })

    def create_dto_to_entity(self, dto: CreateOrderDTO) -> Order:
        return Order(
            id=dto.id,
            user_id=dto.user_id,
            product_id=dto.product_id,
            seller_id=dto.seller_id,
            step=dto.step,
            search_screenshot_path=dto.search_screenshot_path,
            cart_screenshot_path=dto.cart_screenshot_path,
            card_number=dto.card_number,
            phone_number=dto.phone_number,
            name=dto.name,
            bank=dto.bank,
            final_cart_screenshot_path=dto.final_cart_screenshot_path,
            delivery_screenshot_path=dto.delivery_screenshot_path,
            barcodes_screenshot_path=dto.barcodes_screenshot_path,
            review_screenshot_path=dto.review_screenshot_path,
            receipt_screenshot_path=dto.receipt_screenshot_path,
            receipt_number=dto.receipt_number,
            status=dto.status,
            created_at=dto.created_at,
            updated_at=dto.updated_at
        )

    def entity_to_model(self, entity: Order) -> OrderModel:
        def _map_product(product: Product) -> ProductModel:
            return ProductModel(
                id=product.id,
                seller_id=product.seller_id,
                name=product.name,
                brand=product.brand,
                article=product.article,
                category=product.category,
                key_word=product.key_word,
                general_repurchases=product.general_repurchases,
                daily_repurchases=product.daily_repurchases,
                price=product.price,
                wb_price=product.wb_price,
                tg=product.tg,
                status=product.status,
                payment_time=product.payment_time,
                review_requirements=product.review_requirements,
                image_path=product.image_path,
                created_at=product.created_at,
                updated_at=product.updated_at
            )

        def _map_user(user: User) -> UserModel:
            return UserModel(
                id=user.id,
                telegram_id=user.telegram_id,
                nickname=user.nickname,
                role=user.role,
                is_banned=user.is_banned,
                balance=user.balance,
                is_seller=user.is_seller,
                created_at=user.created_at,
                updated_at=user.updated_at
            )

        return OrderModel(
            id=entity.id,
            user_id=entity.user_id,
            product_id=entity.product_id,
            step=entity.step,
            search_screenshot_path=entity.search_screenshot_path,
            cart_screenshot_path=entity.cart_screenshot_path,
            card_number=entity.card_number,
            phone_number=entity.phone_number,
            name=entity.name,
            bank=entity.bank,
            final_cart_screenshot_path=entity.final_cart_screenshot_path,
            delivery_screenshot_path=entity.delivery_screenshot_path,
            barcodes_screenshot_path=entity.barcodes_screenshot_path,
            review_screenshot_path=entity.review_screenshot_path,
            receipt_screenshot_path=entity.receipt_screenshot_path,
            receipt_number=entity.receipt_number,
            status=entity.status,
            seller_id=entity.seller_id,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            product=_map_product(entity.product),
            user=_map_user(entity.user),
            seller=_map_user(entity.user)
        )

    async def get_orders_by_user(self, user_id: UUID) -> List[Order]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.user_id == user_id, self.entity.step < 7, self.entity.status ==
                       OrderStatus.CASHBACK_NOT_PAID)
                .options(*self.options)
            )
            orders = result.scalars().all()
            return [self.entity_to_model(order) for order in orders]


    async def get_user_report(self, order_id: UUID) -> Order:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.id == order_id)
                .options(*self.options)
            )
            order = result.scalars().first()
            return self.entity_to_model(order)

    async def get_orders_by_seller(self, seller_id: UUID) -> list[Order]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.seller_id == seller_id, self.entity.step == 7)
                .options(*self.options)
            )
            orders = result.scalars().all()
            return [self.entity_to_model(order) for order in orders]
