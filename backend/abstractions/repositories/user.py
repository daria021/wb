from abc import ABC, abstractmethod
from typing import Optional

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
    async def ensure_user(self, dto: CreateUserDTO) -> User:
        ...
