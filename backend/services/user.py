import logging
from dataclasses import dataclass
from typing import List
from uuid import UUID

from abstractions.repositories.user import UserRepositoryInterface
from abstractions.services import UserServiceInterface
from abstractions.services.notification import NotificationServiceInterface
from domain.dto import CreateUserDTO, UpdateUserDTO
from domain.models import User
from infrastructure.enums.user_role import UserRole

logger = logging.getLogger(__name__)


@dataclass
class UserService(UserServiceInterface):
    user_repository: UserRepositoryInterface
    notification_service: NotificationServiceInterface

    async def create_user(self, dto: CreateUserDTO) -> None:
        return await self.user_repository.create(dto)

    async def get_user(self, user_id: UUID) -> User:
        return await self.user_repository.get(user_id)

    async def update_user(self, user_id: UUID, dto: UpdateUserDTO) -> None:
        await self.user_repository.update(user_id, dto)

    async def delete_user(self, user_id: UUID) -> None:
        await self.user_repository.delete(user_id)

    async def get_users(self, limit: int = 100, offset: int = 0) -> List[User]:
        return await self.user_repository.get_all(limit=limit, offset=offset)

    async def ensure_user(self, dto: CreateUserDTO) -> tuple[bool, User]:
        return await self.user_repository.ensure_user(dto)

    async def get_user_products(self, user_id: UUID):
        return await self.user_repository.get_user_products(user_id)

    async def ban(self, user_id: UUID):
        dto = UpdateUserDTO(
            is_banned=True,
        )
        await self.user_repository.update(
            obj_id=user_id,
            obj=dto,
        )

    async def unban(self, user_id: UUID):
        dto = UpdateUserDTO(
            is_banned=False,
        )
        await self.user_repository.update(
            obj_id=user_id,
            obj=dto,
        )

    async def promote_user(self, user_id: UUID):
        dto = UpdateUserDTO(
            role=UserRole.MODERATOR,
        )
        await self.user_repository.update(
            obj_id=user_id,
            obj=dto,
        )

    async def demote_user(self, user_id: UUID) -> None:
        dto = UpdateUserDTO(
            role=UserRole.USER,
        )
        await self.user_repository.update(
            obj_id=user_id,
            obj=dto,
        )

    async def get_banned(self) -> list[User]:
        return await self.user_repository.get_banned()

    async def get_sellers(self) -> list[User]:
        return await self.user_repository.get_sellers()

    async def get_clients(self) -> list[User]:
        return await self.user_repository.get_clients()

    async def get_moderators(self) -> list[User]:
        return await self.user_repository.get_moderators()

    async def increase_balance(self, user_id: UUID, balance_sum: int):
        update_dto = UpdateUserDTO(
            balance=balance_sum
        )
        res = await self.user_repository.update(user_id, update_dto)
        try:
            await self.notification_service.send_balance_increased(
                user_id=user_id,
                amount=balance_sum,
            )
        except Exception:
            logger.error("Error while sending push notification", exc_info=True)

        return res

    async def increase_referrer_bonus(self, user_id: UUID, bonus: int) -> None:
        await self.user_repository.increase_referrer_bonus(user_id, bonus)

    async def use_discount(self, user_id: UUID) -> None:
        update_dto = UpdateUserDTO(
            has_discount=False,
        )

        await self.user_repository.update(user_id, update_dto)
