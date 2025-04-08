from dataclasses import dataclass

from abstractions.repositories.push import PushRepositoryInterface
from domain.dto import CreatePushDTO, UpdatePushDTO
from domain.models import Push as PushModel
from infrastructure.entities import Push
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository

@dataclass
class PushRepository(
    AbstractSQLAlchemyRepository[Push, PushModel, CreatePushDTO, UpdatePushDTO],
    PushRepositoryInterface
):

    def create_dto_to_entity(self, dto: CreatePushDTO) -> Push:
        return Push(
            id=dto.id,
            title=dto.title,
            text=dto.text,

            creator_id=dto.creator_id,
            image_path=dto.image_path,
            created_at=dto.created_at,
            updated_at=dto.updated_at
        )

    def entity_to_model(self, entity: Push) -> PushModel:
        return PushModel(
            id=entity.id,
            title=entity.title,
            text=entity.text,
            creator_id=entity.creator_id,
            image_path=entity.image_path,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )
