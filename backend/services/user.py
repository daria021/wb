import logging
from dataclasses import dataclass
from typing import List, Optional
from uuid import UUID

from abstractions.repositories import ProductRepositoryInterface
from abstractions.repositories.increasing_balance import IncreasingBalanceRepositoryInterface
from abstractions.repositories.user import UserRepositoryInterface
from abstractions.services import UserServiceInterface
from abstractions.services.notification import NotificationServiceInterface
from dependencies.repositories.increasing_balance import get_increasing_balance_repository
from dependencies.repositories.user_history import get_user_history_repository
from domain.dto import CreateUserDTO, UpdateUserDTO, UpdateProductDTO
from domain.dto.increasing_balance import CreateIncreasingBalanceDTO
from domain.models import User
from infrastructure.entities import UserHistory, IncreasingBalance
from infrastructure.enums.product_status import ProductStatus
from infrastructure.enums.user_role import UserRole
from utils.referral import uuid_to_b64url

logger = logging.getLogger(__name__)


@dataclass
class UserService(UserServiceInterface):
    user_repository: UserRepositoryInterface
    notification_service: NotificationServiceInterface
    product_repository: ProductRepositoryInterface
    increasing_balance_repository: IncreasingBalanceRepositoryInterface

    bot_username: str

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

    async def ensure_user(self, dto: CreateUserDTO) -> User:
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
        user = await self.user_repository.get(user_id)
        update_dto = UpdateUserDTO(
            balance=user.balance + balance_sum,
        )
        res = await self.user_repository.update(user_id, update_dto)
        try:
            await self.notification_service.send_balance_increased(
                user_id=user_id,
                amount=balance_sum,
            )
        except Exception:
            logger.error("Error while sending push notification", exc_info=True)

        products = await self.product_repository.get_by_seller(user_id)
        necessary_balance = sum(product.remaining_products for product in products if product.status==ProductStatus.ACTIVE
                                or product.status==ProductStatus.NOT_PAID)
        if user.balance + balance_sum >= necessary_balance:
            for product in products:
                if product.status == ProductStatus.NOT_PAID:
                    update_product_dto = UpdateProductDTO(
                        status=ProductStatus.ACTIVE,
                    )
                    await self.product_repository.update(product.id, update_product_dto)
        else:
            active_products_sum = sum(product.remaining_products for product in products if product.status == ProductStatus.ACTIVE)
            not_paid_products = [product for product in products if product.status == ProductStatus.NOT_PAID]
            for product in not_paid_products:
                if user.balance + balance_sum >= active_products_sum + product.remaining_products:
                    update_product_dto = UpdateProductDTO(
                        status=ProductStatus.ACTIVE,
                    )
                    await self.product_repository.update(product.id, update_product_dto)

        create_increasing_balance_dto = CreateIncreasingBalanceDTO(
            user_id=user_id,
        sum=balance_sum,
        )

        await self.increasing_balance_repository.create(create_increasing_balance_dto)

        return res

    async def increase_referrer_bonus(self, user_id: UUID, bonus: int) -> None:
        await self.user_repository.increase_referrer_bonus(user_id, bonus)

    async def use_discount(self, user_id: UUID) -> None:
        update_dto = UpdateUserDTO(
            has_discount=False,
        )
        await self.user_repository.update(user_id, update_dto)

    # async def get_invite_link(self, user_id: UUID) -> str:
    #     return f'https://t.me/{self.bot_username}?start={user_id}'

    async def get_invite_link(self, user_id: UUID) -> str:
        token = uuid_to_b64url(user_id)  # 22 символа
        # по желанию добавьте префикс для роутинга/совместимости: start=ref_<token>
        return f'https://t.me/{self.bot_username}?start={token}'

    async def get_user_history(self, user_id: UUID) -> list[UserHistory]:
        user_history_repository = get_user_history_repository()
        return await user_history_repository.get_by_user(user_id)

    async def get_user_history_balance(self, user_id: UUID) -> Optional[list[IncreasingBalance]]:
        increasing_balance_repository = get_increasing_balance_repository()
        return await increasing_balance_repository.get_balance_history_by_user(user_id)
