from typing import Optional
from uuid import UUID

from sqlalchemy import select

from abstractions.repositories.user import UserRepositoryInterface
from domain.dto.user import CreateUserDTO, UpdateUserDTO
from domain.models import User as UserModel
from infrastructure.db.entities import User
from infrastructure.db.enums import UserRole
from infrastructure.db.repositories.sqlalchemy import AbstractSQLAlchemyRepository


class UserRepository(
    AbstractSQLAlchemyRepository[User, User, CreateUserDTO, UpdateUserDTO],
    UserRepositoryInterface
):
    async def get_moderators(self) -> list[UserModel]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.role == UserRole.MODERATOR)
            )

            result = result.scalars().all()

        return [self.entity_to_model(x) for x in result]


    async def get_sellers(self) -> list[UserModel]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.is_seller == True)
            )

            result = result.scalars().all()

        return [self.entity_to_model(x) for x in result]

    async def get_banned(self) -> list[UserModel]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.is_banned == True)
            )

            result = result.scalars().all()

        return [self.entity_to_model(x) for x in result]

    async def get_by_telegram_id(self, telegram_id: str) -> Optional[User]:
        async with self.session_maker() as session:
            result = await session.execute(select(self.entity).where(self.entity.telegram_id == telegram_id))
            user = result.scalars().first()
            if user:
                return self.entity_to_model(user)
            return None

    async def become_seller(self, user_id: UUID):
        async with self.session_maker() as session:
            user = await session.get(self.entity, user_id)
            async with session.begin():
                user.is_seller = True

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

    def create_dto_to_entity(self, dto: CreateUserDTO) -> User:
        return User(
            id=dto.id,
            telegram_id=dto.telegram_id,
            nickname=dto.nickname,
            is_banned=False,
            is_seller=False,
            role=UserRole(dto.role),
            balance=0,
            created_at=dto.created_at,
            updated_at=dto.updated_at
        )

    def entity_to_model(self, entity: User) -> UserModel:
        return UserModel(
            id=entity.id,
            telegram_id=entity.telegram_id,
            nickname=entity.nickname,
            role=entity.role,
            balance=entity.balance,
            is_banned=entity.is_banned,
            is_seller=entity.is_seller,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )
