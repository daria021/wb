from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from abstractions.repositories import CRUDRepositoryInterface
from domain.dto import CreateUserDTO, UpdateUserDTO
from domain.models import User


class UserRepositoryInterface(
    CRUDRepositoryInterface[User, CreateUserDTO, UpdateUserDTO],
    ABC,
):
    @abstractmethod
    async def get_by_telegram_id(self, telegram_id: str) -> Optional[User]:
        ...

    @abstractmethod
    async def ensure_user(self, dto: CreateUserDTO) -> tuple[bool, User]:
        ...

    @abstractmethod
    async def get_moderators(self) -> list[User]:
        ...

    @abstractmethod
    async def get_sellers(self) -> list[User]:
        ...

    @abstractmethod
    async def get_clients(self) -> list[User]:
        ...

    @abstractmethod
    async def get_banned(self) -> list[User]:
        ...

    @abstractmethod
    async def become_seller(self, user_id: UUID):
        ...

    @abstractmethod
    async def increase_referrer_bonus(self, user_id: UUID, bonus: int) -> None:
        ...
