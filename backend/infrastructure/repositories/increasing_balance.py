import logging
from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from abstractions.repositories.increasing_balance import IncreasingBalanceRepositoryInterface
from domain.dto.increasing_balance import CreateIncreasingBalanceDTO, UpdateIncreasingBalanceDTO
from domain.models.increasing_balance import IncreasingBalance as IncreasingBalanceModel
from infrastructure.entities import IncreasingBalance
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository
from sqlalchemy import select
logger = logging.getLogger(__name__)


@dataclass
class IncreasingBalanceRepository(
    AbstractSQLAlchemyRepository[IncreasingBalance, IncreasingBalanceModel, CreateIncreasingBalanceDTO, UpdateIncreasingBalanceDTO],
    IncreasingBalanceRepositoryInterface,
):

    async def get_balance_history_by_user(self, user_id: UUID) -> Optional[list[IncreasingBalance]]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.user_id == user_id)
            )

            result = result.scalars().all()

        return [self.entity_to_model(history) for history in result]

    def create_dto_to_entity(self, dto: CreateIncreasingBalanceDTO) -> IncreasingBalance:
        return IncreasingBalance(
            id=dto.id,
            sum=dto.sum,
            user_id=dto.user_id,
            created_at=dto.created_at,
            updated_at=dto.updated_at,
        )

    def entity_to_model(self, entity: IncreasingBalance) -> IncreasingBalanceModel:
        return IncreasingBalanceModel(
            id=entity.id,
            sum=entity.sum,
            user_id=entity.user_id,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

