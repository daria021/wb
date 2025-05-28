# import logging
from uuid import UUID

from abstractions.repositories.seller_review import SellerReviewRepositoryInterface
from domain.dto.seller_review import CreateSellerReviewDTO, UpdateSellerReviewDTO
from domain.models.seller_review import SellerReview as SellerReviewModel
from infrastructure.entities import SellerReview
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository
from sqlalchemy import select

# logger = logging.get_logger(__name__)

class SellerReviewRepository(AbstractSQLAlchemyRepository[SellerReview, SellerReviewModel,
CreateSellerReviewDTO, UpdateSellerReviewDTO],
                       SellerReviewRepositoryInterface):

    async def get_seller_reviews_by_seller(self, seller_id: UUID):
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.seller_id == seller_id)
                .options(*self.options)
            )
        reviews = result.scalars().all()
        return [self.entity_to_model(review) for review in reviews]

    def create_dto_to_entity(self, dto: CreateSellerReviewDTO) -> SellerReview:
        return SellerReview(
            id=dto.id,
            seller_id=dto.seller_id,
            sender_id=dto.sender_id,
            review=dto.review,
            created_at=dto.created_at,
            updated_at=dto.updated_at
        )

    def entity_to_model(self, entity: SellerReview) -> SellerReviewModel:
        return SellerReviewModel(
            id=entity.id,
            seller_id=entity.id,
            sender_id=entity.sender_id,
            review=entity.review,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )


