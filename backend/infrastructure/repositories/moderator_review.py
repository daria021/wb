from abstractions.repositories.moderator_review import ModeratorReviewRepositoryInterface
from domain.dto.moderator_review import CreateModeratorReviewDTO, UpdateModeratorReviewDTO
from infrastructure.entities import ModeratorReview
from domain.models.moderator_review import ModeratorReview as ModeratorReviewModel
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository


class ModeratorReviewRepository(
    AbstractSQLAlchemyRepository[ModeratorReview, ModeratorReviewModel, CreateModeratorReviewDTO, UpdateModeratorReviewDTO],
    ModeratorReviewRepositoryInterface,
):
    def create_dto_to_entity(self, dto: ModeratorReview) -> ModeratorReviewModel:
        return ModeratorReview(
            id=dto.id,
            moderator_id=dto.moderator_id,
            product_id=dto.product_id,
            comment=dto.comment,
            status_before=dto.status_before,
            status_after=dto.status_after,
            created_at=dto.created_at,
            updated_at=dto.updated_at,
        )

    def entity_to_model(self, entity: ModeratorReview) -> ModeratorReviewModel:
        return ModeratorReviewModel(
            id=entity.id,
            moderator_id=entity.moderator_id,
            product_id=entity.product_id,
            comment=entity.comment,
            status_before=entity.status_before,
            status_after=entity.status_after,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
