from typing import List, Optional
from uuid import UUID

from abstractions.repositories.moderator_review import ModeratorReviewRepositoryInterface
from domain.dto.moderator_review import CreateModeratorReviewDTO, UpdateModeratorReviewDTO
from infrastructure.entities import ModeratorReview, Product
from domain.models.moderator_review import ModeratorReview as ModeratorReviewModel
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository
from sqlalchemy import select

class ModeratorReviewRepository(
    AbstractSQLAlchemyRepository[ModeratorReview, ModeratorReviewModel, CreateModeratorReviewDTO, UpdateModeratorReviewDTO],
    ModeratorReviewRepositoryInterface,
):

    async def get_by_user(self, user_id: UUID) -> List[ModeratorReview]:
        async with self.session_maker() as session:
            stmt = (
                select(self.entity)
                .join(Product, Product.id == self.entity.product_id)
                .where(Product.seller_id == user_id)
            )
            result = await session.execute(stmt)
            entities = result.scalars().all()

        return [self.entity_to_model(e) for e in entities]

    def create_dto_to_entity(self, dto: CreateModeratorReviewDTO) -> ModeratorReview:
        return ModeratorReview(
            id=dto.id,
            moderator_id=dto.moderator_id,
            comment_to_seller=dto.comment_to_seller,
            product_id=dto.product_id,
            comment_to_moderator=dto.comment_to_moderator,
            status_before=dto.status_before,
            status_after=dto.status_after,
            created_at=dto.created_at,
            updated_at=dto.updated_at,
        )

    def entity_to_model(self, entity: ModeratorReview) -> ModeratorReviewModel:
        return ModeratorReviewModel(
            id=entity.id,
            moderator_id=entity.moderator_id,
            comment_to_seller=entity.comment_to_seller,
            product_id=entity.product_id,
            comment_to_moderator=entity.comment_to_moderator,
            status_before=entity.status_before,
            status_after=entity.status_after,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
