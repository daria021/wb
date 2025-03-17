from dataclasses import field, dataclass
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from abstractions.repositories import OrderRepositoryInterface
from domain.dto import CreateOrderDTO, UpdateOrderDTO
from domain.models import Order, Product as ProductModel
from domain.models.order import Order as OrderModel
from infrastructure.entities import Order, Product
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository


@dataclass
class OrderRepository(
    AbstractSQLAlchemyRepository[Order, OrderModel, CreateOrderDTO, UpdateOrderDTO],
    OrderRepositoryInterface,
):
    joined_fields: dict[str, Optional[list[str]]] = field(default_factory=lambda: {
        'product': None,
    })

    def create_dto_to_entity(self, dto: CreateOrderDTO) -> Order:
        return Order(
            id=dto.id,
            user_id=dto.user_id,
            product_id=dto.product_id,
            card_number=dto.card_number,
            screenshot_path=dto.screenshot_path,
            status=dto.status,
            created_at=dto.created_at,
            updated_at=dto.updated_at
        )

    def entity_to_model(self, entity: Order) -> OrderModel:
        def _map_product(product: Product) -> ProductModel:
            return ProductModel(
                id=product.id,
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
                payment_time=product.payment_time,
                review_requirements=product.review_requirements,
                seller_id=product.seller_id,
                image_path=product.image_path,
                created_at=product.created_at,
                updated_at=product.updated_at
            )

        return OrderModel(
            id=entity.id,
            user_id=entity.user_id,
            product_id=entity.product_id,
            card_number=entity.card_number,
            screenshot_path=entity.screenshot_path,
            status=entity.status,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            product=_map_product(entity.product)
        )

    async def get_orders_by_user(self, user_id: UUID) -> List[Order]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.user_id == user_id)
                .options(*self.options)
            )
            orders = result.scalars().all()
            return [self.entity_to_model(order) for order in orders]
