from dataclasses import dataclass
from typing import List
from uuid import UUID

from abstractions.repositories.user import UserRepositoryInterface
from abstractions.services import UserServiceInterface
from domain.dto import CreateUserDTO, UpdateUserDTO
from domain.models import User


@dataclass
class UserService(UserServiceInterface):
    user_repository: UserRepositoryInterface

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

    async def ensure_user(self, user: CreateUserDTO):
        return await self.user_repository.ensure_user(user)

    async def get_user_products(self, user_id: UUID):
        return await self.user_repository.get_user_products(user_id)

