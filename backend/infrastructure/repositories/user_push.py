from dataclasses import field, dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import select

from abstractions.repositories.user_push import UserPushRepositoryInterface
from domain.dto.user_push import CreateUserPushDTO, UpdateUserPushDTO
from domain.models import UserPush as UserPushModel, User as UserModel, Push as PushModel
from infrastructure.entities import UserPush, User, Push
from infrastructure.enums.push_status import PushStatus
from infrastructure.repositories.sqlalchemy import AbstractSQLAlchemyRepository

@dataclass
class UserPushRepository(
    AbstractSQLAlchemyRepository[UserPush, UserPushModel, CreateUserPushDTO, UpdateUserPushDTO],
    UserPushRepositoryInterface
):
    joined_fields: dict[str, Optional[list[str]]] = field(default_factory=lambda: {
        'user': None,
        'push': None,
    })

    async def set_status(self, user_push_id: UUID, status: PushStatus, sent_at: Optional[datetime] = None):
        async with self.session_maker() as session:
            async with session.begin():
                user_push = await session.get(self.entity, user_push_id)
                user_push.status = status
                if sent_at:
                    user_push.sent_at = sent_at

    async def get_queued_pushes(self, size: int = 10) -> list[UserPush]:
        async with self.session_maker() as session:
            res = await session.execute(
                select(self.entity.status == PushStatus.PLANNED)
                .options(*self.options)
                .order_by(self.entity.created_at)
                .limit(size)
            )
            res = res.unique().scalars().all()

        return [self.entity_to_model(x) for x in res]  # noqa

    def create_dto_to_entity(self, dto: CreateUserPushDTO) -> UserPush:
        return UserPush(
            id=dto.id,
            push_id=dto.push_id,
            user_id=dto.user_id,
            sent_at=None,
            status=PushStatus.PLANNED,
            created_at=dto.created_at,
            updated_at=dto.updated_at
        )

    def entity_to_model(self, entity: UserPush) -> UserPushModel:
        def _map_user(user: User) -> UserModel:
            return UserModel(
                id=user.id,
                telegram_id=user.telegram_id,
                nickname=user.nickname,
                role=user.role,
                balance=user.balance,
                is_banned=user.is_banned,
                is_seller=user.is_seller,
                created_at=user.created_at,
                updated_at=user.updated_at,
            )

        def _map_push(push: Push) -> PushModel:
            return PushModel(
                id=push.id,
                title=push.title,
                text=push.text,
                creator_id=push.creator_id,
                image_path=push.image_path,
                created_at=push.created_at,
                updated_at=push.updated_at
            )

        return UserPushModel(
            id=entity.id,
            push_id=entity.push_id,
            user_id=entity.user_id,
            sent_at=entity.sent_at,
            status=entity.status,
            user=_map_user(entity.user) if entity.user else None,
            push=_map_push(entity.push) if entity.push else None,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )
