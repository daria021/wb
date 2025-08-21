from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from abstractions.repositories.push import PushRepositoryInterface
from domain.dto import CreatePushDTO, UpdatePushDTO
from domain.models import Push as PushModel
from infrastructure.entities import Push
from infrastructure.repositories.exceptions import NotFoundException
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository


@dataclass
class PushRepository(
    AbstractSQLAlchemyRepository[Push, PushModel, CreatePushDTO, UpdatePushDTO],
    PushRepositoryInterface
):
    _soft_delete: bool = field(default=True)
    #
    # async def delete(self, obj_id: UUID) -> None:
    #     async with self.session_maker() as session:
    #         async with session.begin():
    #             obj = await session.get(self.entity, obj_id)
    #             obj.deleted_at = datetime.now()
    #
    # async def get_all(self, limit: int = 100, offset: int = 0, joined: bool = True) -> list[PushModel]:
    #     async with self.session_maker() as session:
    #         if joined:
    #             if self.options:
    #                 return [
    #                     self.entity_to_model(entity)
    #                     for entity in (await session.execute(
    #                         select(self.entity)
    #                         .where(self.entity.deleted_at == None)
    #                         .limit(limit)
    #                         .offset(offset)
    #                         .options(*self.options)
    #                     )).unique().scalars().all()
    #                 ]
    #         res = (await session.execute(
    #             select(self.entity)
    #             .where(self.entity.deleted_at == None)
    #             .limit(limit)
    #             .offset(offset)
    #         )).scalars().all()
    #         return [
    #             self.entity_to_model(entity)
    #             for entity in res
    #         ]
    #
    # async def get(self, obj_id: UUID) -> PushModel:
    #     async with self.session_maker() as session:
    #         try:
    #             if self.options:
    #                 res = await session.execute(
    #                     select(self.entity)
    #                     .where(
    #                         self.entity.id == obj_id,
    #                         self.entity.deleted_at == None,
    #                     )
    #                     .options(*self.options)
    #                 )
    #                 obj = res.unique().scalars().one()
    #             else:
    #                 obj = await session.get(self.entity, obj_id)
    #             return self.entity_to_model(obj)
    #         except NoResultFound:
    #             raise NotFoundException

    def create_dto_to_entity(self, dto: CreatePushDTO) -> Push:
        return Push(
            id=dto.id,
            title=dto.title,
            text=dto.text,
            button_text=dto.button_text,
            button_link=dto.button_link,
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
            button_text=entity.button_text,
            button_link=entity.button_link,
            creator_id=entity.creator_id,
            image_path=entity.image_path,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )
