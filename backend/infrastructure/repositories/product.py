import logging
from dataclasses import field, dataclass
from typing import Optional, Any
from uuid import UUID

from sqlalchemy import select, case, String, cast, func
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.exc import DetachedInstanceError

from abstractions.repositories import ProductRepositoryInterface
from domain.dto import CreateProductDTO, UpdateProductDTO
from domain.models import Product as ProductModel
from domain.models.moderator_review import ModeratorReview as ModeratorReviewModel
from infrastructure.entities import Product, ModeratorReview
from infrastructure.enums.product_status import ProductStatus
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository

logger = logging.getLogger(__name__)


@dataclass
class ProductRepository(
    AbstractSQLAlchemyRepository[Product, ProductModel, CreateProductDTO, UpdateProductDTO],
    ProductRepositoryInterface,
):
    joined_fields: dict[str, Optional[list[str]]] = field(default_factory=lambda: {
        'moderator_reviews': None,
    })

    def __post_init__(self):
        super().__post_init__()
        self.options = [
            joinedload(self.entity.moderator_reviews),
        ]

    async def get_active_products(self, limit: int = 100, offset: int = 9) -> list[ProductModel]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.status == ProductStatus.ACTIVE)
                .limit(limit)
                .offset(offset)
            )
            products = result.scalars().all()
        return [self.entity_to_model(product) for product in products]

    async def get_by_seller(self, user_id: UUID) -> Optional[list[ProductModel]]:
        priority_case = case(
            {
                ProductStatus.CREATED.value.upper(): 1,
                ProductStatus.ACTIVE.value.upper(): 2,
                ProductStatus.DISABLED.value.upper(): 3,
                ProductStatus.REJECTED.value.upper(): 4,
                ProductStatus.ARCHIVED.value.upper(): 5,
            },
            value=func.upper(cast(Product.status, String)),
            else_=99
        )
        async with self.session_maker() as session:
            result = await session.execute(
                select(Product)
                .where(Product.seller_id == user_id)
                .order_by(
                    priority_case.asc(),
                    Product.created_at.asc(),
                )
                .options(*self.options)
            )
            products = result.unique().scalars().all()

        return [self.entity_to_model(product) for product in products]

    async def get_products_to_review(self) -> list[ProductModel]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                # .where(self.entity.status == ProductStatus.CREATED)
                .options(*self.options)
            )
            result = result.unique().scalars().all()
        return [self.entity_to_model(x) for x in result]

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
            status=ProductStatus.CREATED,
            image_path=dto.image_path,
            created_at=dto.created_at,
            updated_at=dto.updated_at,
        )

    def entity_to_model(self, entity: Product) -> ProductModel:
        def _map_moderator_review(review: ModeratorReview) -> ModeratorReviewModel:
            return ModeratorReviewModel.model_validate(review)

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
            status=entity.status,
            image_path=entity.image_path,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            moderator_reviews=[
                _map_moderator_review(x)
                for x in self._get_relation(entity, 'moderator_reviews', use_list=True)
            ]
        )

    @staticmethod
    def _get_relation(entity: Product, relation: str, use_list: bool = False) -> Optional[Any]:
        try:
            logger.info(f"Getting {relation} from {entity.id}")
            return getattr(entity, relation)
        except DetachedInstanceError:
            return [] if use_list else None

    async def get_by_article(self, article: str) -> Optional[Product]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.article == article)
            )
            product = result.scalars().one_or_none()
        if product:
            return self.entity_to_model(product)
        return None
