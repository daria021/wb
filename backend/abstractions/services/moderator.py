from abc import ABC, abstractmethod
from uuid import UUID

from domain.models import Product, User
from routes.requests.moderator import UpdateProductStatusRequest


class ModeratorServiceInterface(ABC):
    @abstractmethod
    async def get_products(self) -> list[Product]:
        ...

    @abstractmethod
    async def get_product(self, product_id: UUID) -> Product:
        ...

    @abstractmethod
    async def get_products_to_review(self) -> list[Product]:
        ...

    @abstractmethod
    async def review_product(
            self,
            product_id: UUID,
            moderator_id: UUID,
            request: UpdateProductStatusRequest,
    ) -> None:
        ...

    @abstractmethod
    async def get_users(self) -> list[User]:
        ...

    @abstractmethod
    async def get_user(self, user_id: UUID) -> User:
        ...

    @abstractmethod
    async def get_moderators(self) -> list[User]:
        ...

    @abstractmethod
    async def get_sellers(self) -> list[User]:
        ...

    @abstractmethod
    async def get_banned(self) -> list[User]:
        ...

    @abstractmethod
    async def ban_user(self, user_id: UUID) -> None:
        ...

    @abstractmethod
    async def unban_user(self, user_id: UUID) -> None:
        ...

    @abstractmethod
    async def promote_user(self, user_id: UUID) -> None:
        ...

    @abstractmethod
    async def demote_user(self, user_id: UUID) -> None:
        ...
