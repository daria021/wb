import logging
from dataclasses import dataclass
from uuid import UUID

from abstractions.repositories import ProductRepositoryInterface
from abstractions.repositories.moderator_review import ModeratorReviewRepositoryInterface
from abstractions.services import UserServiceInterface
from abstractions.services.moderator import ModeratorServiceInterface
from abstractions.services.notification import NotificationServiceInterface
from domain.dto import UpdateProductDTO, CreatePushDTO, UpdatePushDTO
from domain.dto.moderator_review import CreateModeratorReviewDTO
from domain.models import Product, User, Push
from infrastructure.enums.product_status import ProductStatus
from routes.requests.moderator import UpdateProductStatusRequest

logger = logging.getLogger(__name__)
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

        if request.status == ProductStatus.ACTIVE:
            product = await self.products_repository.get(product_id)
            logger.info(f"Reviewing product {product}")
            seller = await self.user_service.get_user(product.seller_id)
            seller_products = await self.products_repository.get_by_seller(product.seller_id)
            required_balance = sum(
                product.general_repurchases
                for product in seller_products
                if product.status == ProductStatus.ACTIVE or product.status == ProductStatus.NOT_PAID
            )
            logger.info(f"required_balance {required_balance}")
            logger.info(f"seller.balance {seller.balance}")
            if required_balance > seller.balance:
                status = ProductStatus.NOT_PAID
            else:
                status = request.status
        else:
            status = request.status

        product_dto = UpdateProductDTO(
            status=status,
        )

        await self.products_repository.update(
            obj_id=product_id,
            obj=product_dto,
        )

        review_dto = CreateModeratorReviewDTO(
            moderator_id=moderator_id,
            product_id=product_id,
            comment_to_seller=request.comment_to_seller,
            comment_to_moderator=request.comment_to_moderator,
            status_before=product.status,
            status_after=status,
        )
        await self.moderator_review_repository.create(review_dto)

        if review_dto.status_after == ProductStatus.ACTIVE and review_dto.status_before != ProductStatus.ACTIVE:
            await self.notification_service.send_new_product(product_id)

    async def get_users(self) -> list[User]:
        return await self.user_service.get_users()

    async def get_user(self, user_id: UUID) -> User:
         return await self.user_service.get_user(user_id)

    async def get_moderators(self) -> list[User]:
        return await self.user_service.get_moderators()

    async def get_sellers(self) -> list[User]:
        return await self.user_service.get_sellers()

    async def get_clients(self) -> list[User]:
        return await self.user_service.get_clients()

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

    async def update_push(self, push_id: UUID, update_dto: UpdatePushDTO) -> None:
        return await self.notification_service.update_push(push_id, update_dto)

    async def delete_push(self, push_id: UUID) -> None:
        return await self.notification_service.delete_push(push_id)

    async def use_discount(self, user_id: UUID) -> None:
        await self.user_service.use_discount(user_id)

    async def increase_referrer_bonus(self, user_id: UUID, bonus: int) -> None:
        await self.user_service.increase_referrer_bonus(user_id, bonus)
