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
        # 1) Получаем текущее состояние товара
        product = await self.products_repository.get(product_id)
        original_status = product.status

        # 2) Вычисляем итоговый статус
        if request.status == ProductStatus.ACTIVE:
            # 2.1) Берём продавца и все его товары
            seller = await self.user_service.get_user(product.seller_id)
            seller_products = await self.products_repository.get_by_seller(product.seller_id)

            # 2.2) Суммируем уже зарезервированные (активные) раздачи
            existing_reserved = sum(
                p.general_repurchases
                for p in seller_products
                if p.status == ProductStatus.ACTIVE
            )

            # 2.3) Если товар ещё не был активен, добавляем его запрос
            to_reserve = existing_reserved
            if original_status != ProductStatus.ACTIVE:
                to_reserve += product.general_repurchases

            logger.info(f"Existing reserved: {existing_reserved}, "
                        f"New request: {product.general_repurchases if original_status != ProductStatus.ACTIVE else 0}, "
                        f"Total required: {to_reserve}, Seller balance: {seller.balance}")

            # 2.4) Решаем, хватит ли баланса
            if to_reserve > seller.balance:
                final_status = ProductStatus.NOT_PAID
            else:
                final_status = ProductStatus.ACTIVE

        else:
            # Любой другой статус просто применяем как есть
            final_status = request.status

        # 3) Обновляем статус товара
        await self.products_repository.update(
            obj_id=product_id,
            obj=UpdateProductDTO(status=final_status)
        )

        # 4) Создаём запись ревью
        review_dto = CreateModeratorReviewDTO(
            moderator_id=moderator_id,
            product_id=product_id,
            comment_to_seller=request.comment_to_seller,
            comment_to_moderator=request.comment_to_moderator,
            status_before=original_status,
            status_after=final_status,
        )
        await self.moderator_review_repository.create(review_dto)

        # 5) Если товар только что стал активным — шлём нотификацию
        if final_status == ProductStatus.ACTIVE and original_status != ProductStatus.ACTIVE:
            await self.notification_service.send_new_product(product_id)
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
