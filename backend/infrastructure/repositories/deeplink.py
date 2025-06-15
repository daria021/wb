import logging
from dataclasses import dataclass, field
from typing import Optional

from sqlalchemy import select

from abstractions.repositories.deeplink import DeeplinkRepositoryInterface
from domain.dto import CreateDeeplinkDTO, UpdateDeeplinkDTO
from domain.models import Deeplink as DeeplinkModel
from infrastructure.entities import Deeplink
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository

logger = logging.getLogger(__name__)


@dataclass
class DeeplinkRepository(
    AbstractSQLAlchemyRepository[Deeplink, DeeplinkModel, CreateDeeplinkDTO, UpdateDeeplinkDTO],
    DeeplinkRepositoryInterface
):
    joined_fields: dict[str, Optional[list[str]]] = field(default_factory=lambda: {

    })

    async def get_by_url(self, url: str) -> Optional[Deeplink]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.url == url)
            )
            result = result.scalars().one_or_none()

        return self.entity_to_model(result) if result else None

    def create_dto_to_entity(self, dto: CreateDeeplinkDTO) -> Deeplink:
        return Deeplink(
            id=dto.id,
            url=dto.url,
            created_at=dto.created_at,
            updated_at=dto.updated_at
        )

    def entity_to_model(self, entity: Deeplink) -> DeeplinkModel:
        return DeeplinkModel(
            id=entity.id,
            url=entity.url,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
