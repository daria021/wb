from dataclasses import dataclass
from uuid import UUID

from abstractions.repositories import ProductRepositoryInterface
from abstractions.repositories.moderator_review import ModeratorReviewRepositoryInterface
from abstractions.services import UserServiceInterface
from abstractions.services.moderator import ModeratorServiceInterface
from abstractions.services.notification import NotificationServiceInterface
from domain.dto import UpdateProductDTO, CreatePushDTO
from domain.dto.moderator_review import CreateModeratorReviewDTO
from domain.models import Product, User, Push
from routes.requests.moderator import UpdateProductStatusRequest


@dataclass
class ModeratorService(ModeratorServiceInterface):
    products_repository: ProductRepositoryInterface
    user_service: UserServiceInterface
    moderator_review_repository: ModeratorReviewRepositoryInterface
    notification_service: NotificationServiceInterface

    async def get_products(self) -> list[Product]:
        return await self.products_repository.get_all()

    async def get_product(self, product_id: UUID) -> Product:
        return await self.products_repository.get(product_id)

    async def get_products_to_review(self) -> list[Product]:
        return await self.products_repository.get_products_to_review()

    async def review_product(
            self,
            product_id: UUID,
            moderator_id: UUID,
            request: UpdateProductStatusRequest,
    ):
        product = await self.products_repository.get(product_id)
        product_dto = UpdateProductDTO(
            status=request.status,
        )
        review_dto = CreateModeratorReviewDTO(
            moderator_id=moderator_id,
            product_id=product_id,
            comment=request.comment,
            status_before=product.status,
            status_after=request.status,
        )
        await self.moderator_review_repository.create(review_dto)
        await self.products_repository.update(
            obj_id=product_id,
            obj=product_dto,
        )

    async def get_users(self) -> list[User]:
        return await self.user_service.get_users()

    async def get_user(self, user_id: UUID) -> User:
         return await self.user_service.get_user(user_id)

    async def get_moderators(self) -> list[User]:
        return await self.user_service.get_moderators()

    async def get_sellers(self) -> list[User]:
        return await self.user_service.get_sellers()

    async def get_banned(self) -> list[User]:
        return await self.user_service.get_banned()

    async def ban_user(self, user_id: UUID):
        await self.user_service.ban(user_id)

    async def unban_user(self, user_id: UUID):
        await self.user_service.unban(user_id)

    async def promote_user(self, user_id: UUID):
        await self.user_service.promote_user(user_id)

    async def demote_user(self, user_id: UUID):
        await self.user_service.demote_user(user_id)

    async def create_push(self, push: CreatePushDTO) -> None:
        await self.notification_service.create_push(push)

    async def activate_push(self, push_id: UUID, user_ids: list[UUID]) -> None:
        await self.notification_service.activate_push(push_id, user_ids)

    async def get_pushes(self) -> list[Push]:
        return await self.notification_service.get_pushes()

    async def get_push(self, push_id: UUID) -> Push:
        return await self.notification_service.get_push(push_id)
