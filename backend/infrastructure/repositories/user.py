import logging
from dataclasses import dataclass, field
from typing import Optional
from uuid import UUID

from sqlalchemy import select

from abstractions.repositories.user import UserRepositoryInterface
from domain.dto import CreateUserDTO, UpdateUserDTO
from domain.models import User as UserModel
from infrastructure.entities import User
from infrastructure.enums.user_role import UserRole
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository

logger = logging.getLogger(__name__)


@dataclass
class UserRepository(
    AbstractSQLAlchemyRepository[User, UserModel, CreateUserDTO, UpdateUserDTO],
    UserRepositoryInterface
):
    joined_fields: dict[str, Optional[list[str]]] = field(default_factory=lambda: {
        'inviter': None,
    })

    async def increase_referrer_bonus(self, user_id: UUID, bonus: int) -> None:
        async with self.session_maker() as session:
            async with session.begin():
                user = await session.get(self.entity, user_id)
                user.referrer_bonus += bonus

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
                .where(self.entity.role == UserRole.SELLER)
            )

            result = result.scalars().all()

        return [self.entity_to_model(x) for x in result]

    async def get_clients(self) -> list[UserModel]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.role == UserRole.CLIENT)
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

    async def get_by_telegram_id(self, telegram_id: int) -> Optional[UserModel]:
        async with self.session_maker() as session:
            result = await session.execute(
                select(self.entity)
                .where(self.entity.telegram_id == telegram_id)
                .options(*self.options)
            )
            user = result.unique().scalars().first()
        if user:
            return self.entity_to_model(user)

        return None

    async def become_seller(self, user_id: UUID):
        async with self.session_maker() as session:
            user = await session.get(self.entity, user_id)
            async with session.begin():
                user.is_seller = True

    async def ensure_user(self, dto: CreateUserDTO) -> UserModel:
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
            invited_by=dto.invited_by,
            referrer_bonus=0,
            has_discount=dto.invited_by is not None,
            created_at=dto.created_at,
            updated_at=dto.updated_at
        )

    def entity_to_model(self, entity: User) -> UserModel:
        def map_inviter(inviter: User) -> UserModel:
            inviter.inviter = None
            return UserModel.model_validate(inviter)

        inviter = self._get_relation(entity, 'inviter')

        return UserModel(
            id=entity.id,
            telegram_id=entity.telegram_id,
            nickname=entity.nickname,
            role=entity.role,
            balance=entity.balance,
            is_banned=entity.is_banned,
            is_seller=entity.is_seller,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            invited_by=entity.invited_by,
            has_discount=entity.has_discount,
            referrer_bonus=entity.referrer_bonus,
            inviter=map_inviter(inviter) if inviter else None,
        )
