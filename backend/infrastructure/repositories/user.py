from typing import Optional

from sqlalchemy import select

from abstractions.repositories.user import UserRepositoryInterface
from domain.dto import CreateUserDTO, UpdateUserDTO
from domain.models import User as UserModel
from infrastructure.entities import User
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository


class UserRepository(AbstractSQLAlchemyRepository[User, User, CreateUserDTO, UpdateUserDTO],
                     UserRepositoryInterface):

    def create_dto_to_entity(self, dto: CreateUserDTO) -> User:
        return User(
            id=dto.id,
            telegram_id=dto.telegram_id,
            nickname=dto.nickname,
            created_at=dto.created_at,
            updated_at=dto.updated_at
        )

    def entity_to_model(self, entity: User) -> UserModel:
        return UserModel(
            id=entity.id,
            telegram_id=entity.telegram_id,
            nickname=entity.nickname,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )

    async def get_by_telegram_id(self, telegram_id: str) -> Optional[User]:
        async with self.session_maker() as session:
            result = await session.execute(select(self.entity).where(self.entity.telegram_id == telegram_id))
            user = result.scalars().first()
            if user:
                return self.entity_to_model(user)
            return None

    async def ensure_user(self, dto: CreateUserDTO) -> User:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.telegram_id == dto.telegram_id)
            )

            user = result.scalars().one_or_none()
        if not user:
            await self.create(dto)

        return await self.get_by_telegram_id(dto.telegram_id)
