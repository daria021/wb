from abc import ABC, abstractmethod
from uuid import UUID

from domain.dto import CreatePushDTO, UpdatePushDTO
from domain.models import Product, User, Push
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
    async def get_clients(self) -> list[User]:
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

    @abstractmethod
    async def create_push(self, push: CreatePushDTO) -> None:
        ...

    @abstractmethod
    async def activate_push(self, push_id: UUID, user_ids: list[UUID]) -> None:
        ...

    @abstractmethod
    async def get_pushes(self) -> list[Push]:
        ...

    @abstractmethod
    async def get_push(self, push_id: UUID) -> Push:
        ...

    @abstractmethod
    async def update_push(self, push_id: UUID, update_dto: UpdatePushDTO) -> None:
        ...

    @abstractmethod
    async def delete_push(self, push_id: UUID) -> None:
        ...

    async def use_discount(self, user_id: UUID) -> None:
        ...

    @abstractmethod
    async def increase_referrer_bonus(self, user_id: UUID, bonus: int) -> None:
        ...

