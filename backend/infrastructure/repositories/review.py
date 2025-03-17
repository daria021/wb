from typing import List
from uuid import UUID

from sqlalchemy import select

from abstractions.repositories import ReviewRepositoryInterface
from domain.dto import CreateReviewDTO, UpdateReviewDTO
from domain.models import Review as ReviewModel
from infrastructure.entities import Review
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository


class ReviewRepository(AbstractSQLAlchemyRepository[Review, Review, CreateReviewDTO, UpdateReviewDTO],
                       ReviewRepositoryInterface):

    def create_dto_to_entity(self, dto: CreateReviewDTO) -> Review:
        return Review(
            id=dto.id,
            user_id=dto.user_id,
            product_id=dto.product_id,
            rating=dto.rating,
            comment=dto.comment,
            created_at=dto.created_at,
            updated_at=dto.updated_at
        )

    def entity_to_model(self, entity: Review) -> ReviewModel:
        return ReviewModel(
            id=entity.id,
            user_id=entity.user_id,
            product_id=entity.product_id,
            rating=entity.rating,
            comment=entity.comment,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )

    async def get_reviews_by_product(self, product_id: UUID) -> List[Review]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity).where(self.entity.product_id == product_id)
            )
            reviews = result.scalars().all()
            return [self.entity_to_model(review) for review in reviews]
