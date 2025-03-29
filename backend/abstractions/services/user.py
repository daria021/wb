from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from domain.dto.user import CreateUserDTO, UpdateUserDTO
from domain.models.user import User


class UserServiceInterface(ABC):
    @abstractmethod
    async def create_user(self, dto: CreateUserDTO) -> User:
        """Зарегистрировать нового пользователя и вернуть его модель."""
        ...

    @abstractmethod
    async def get_user(self, user_id: UUID) -> User:
        """Получить данные пользователя по его идентификатору."""
        ...

    @abstractmethod
    async def update_user(self, user_id: UUID, dto: UpdateUserDTO) -> None:
        """Обновить данные пользователя."""
        ...

    @abstractmethod
    async def delete_user(self, user_id: UUID) -> None:
        """Удалить пользователя."""
        ...

    @abstractmethod
    async def get_users(self, limit: int = 100, offset: int = 0) -> List[User]:
        """Вернуть список пользователей с пагинацией."""
        ...

    @abstractmethod
    async def ensure_user(self, user: CreateUserDTO) -> None:
        ...

    @abstractmethod
    async def get_user_products(self, user_id: UUID) -> None:
        ...

    @abstractmethod
    async def ban(self, user_id: UUID) -> None:
        ...

    @abstractmethod
    async def unban(self, user_id: UUID) -> None:
        ...

    @abstractmethod
    async def promote_user(self, user_id: UUID) -> None:
        ...

    @abstractmethod
    async def demote_user(self, user_id: UUID) -> None:
        ...

    @abstractmethod
    async def get_banned(self) -> list[User]:
        ...

    @abstractmethod
    async def get_sellers(self) -> list[User]:
        ...

    @abstractmethod
    async def get_moderators(self) -> list[User]:
        ...
