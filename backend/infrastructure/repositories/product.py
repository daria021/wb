from typing import Optional
from uuid import UUID

from sqlalchemy import select

from abstractions.repositories import ProductRepositoryInterface
from domain.dto import CreateProductDTO, UpdateProductDTO
from domain.models import Product as ProductModel
from infrastructure.entities import Product
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository


class ProductRepository(
    AbstractSQLAlchemyRepository[Product, Product, CreateProductDTO, UpdateProductDTO],
    ProductRepositoryInterface,
):



    async def get_by_seller(self, user_id: UUID) -> Optional[list[Product]]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(Product).filter(Product.seller_id == user_id)
            )
            products = result.scalars().all()
            return [self.entity_to_model(product) for product in products]



    def create_dto_to_entity(self, dto: CreateProductDTO) -> Product:
        return Product(
            id=dto.id,
            name=dto.name,
            brand=dto.brand,
            article=dto.article,
            category=dto.category,
            key_word=dto.key_word,
            general_repurchases=dto.general_repurchases,
            daily_repurchases=dto.daily_repurchases,
            price=dto.price,
            wb_price=dto.wb_price,
            tg=dto.tg,
            payment_time=dto.payment_time,
            review_requirements=dto.review_requirements,
            seller_id=dto.seller_id,
            image_path=dto.image_path,
            created_at=dto.created_at,
            updated_at=dto.updated_at
        )

    def entity_to_model(self, entity: Product) -> ProductModel:
        return ProductModel(
            id=entity.id,
            name=entity.name,
            brand=entity.brand,
            article=entity.article,
            category=entity.category,
            key_word=entity.key_word,
            general_repurchases=entity.general_repurchases,
            daily_repurchases=entity.daily_repurchases,
            price=entity.price,
            wb_price=entity.wb_price,
            tg=entity.tg,
            payment_time=entity.payment_time,
            review_requirements=entity.review_requirements,
            seller_id=entity.seller_id,
            image_path=entity.image_path,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )

    async def get_by_article(self, article: str) -> Optional[Product]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.article == article)
            )
            product = result.scalars().first()
            if product:
                return self.entity_to_model(product)
            return None
