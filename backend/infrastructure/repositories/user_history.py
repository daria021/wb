import logging
from dataclasses import dataclass
from uuid import UUID

from abstractions.repositories.user_history import UserHistoryRepositoryInterface
from domain.dto.user_history import CreateUserHistoryDTO, UpdateUserHistoryDTO
from domain.models.user_history import UserHistory as UserHistoryModel
from infrastructure.entities import UserHistory
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository
from sqlalchemy import select

logger = logging.getLogger(__name__)


@dataclass
class UserHistoryRepository(
    AbstractSQLAlchemyRepository[UserHistory, UserHistoryModel, CreateUserHistoryDTO, UpdateUserHistoryDTO],
    UserHistoryRepositoryInterface,
):

    async def get_by_user(self, user_id: UUID) -> list[UserHistory]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.user_id == user_id)
            )

            result = result.scalars().all()

        return [self.entity_to_model(history) for history in result]


    def create_dto_to_entity(self, dto: CreateUserHistoryDTO) -> UserHistory:
        return UserHistory(
            id=dto.id,
            user_id=dto.user_id,
            creator_id=dto.creator_id,
            product_id=dto.product_id,
            action=dto.action,
            date=dto.date,
            json_before=dto.json_before,
            json_after=dto.json_after,
            created_at=dto.created_at,
            updated_at=dto.updated_at,
        )

    def entity_to_model(self, entity: UserHistory) -> UserHistoryModel:
        return UserHistoryModel(
            id=entity.id,
            user_id=entity.user_id,
            creator_id=entity.creator_id,
            product_id=entity.product_id,
            action=entity.action,
            date=entity.date,
            json_before=entity.json_before,
            json_after=entity.json_after,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

