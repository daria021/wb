import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from abstractions.repositories import ProductRepositoryInterface, UserRepositoryInterface
from abstractions.repositories.increasing_balance import IncreasingBalanceRepositoryInterface
from abstractions.repositories.push import PushRepositoryInterface
from abstractions.repositories.user_history import UserHistoryRepositoryInterface
from abstractions.repositories.user_push import UserPushRepositoryInterface
from abstractions.services import ProductServiceInterface
from abstractions.services.notification import NotificationServiceInterface
from dependencies.repositories.user_history import get_user_history_repository
from domain.dto import CreateProductDTO, UpdateProductDTO, UpdateUserDTO
from domain.dto.increasing_balance import CreateIncreasingBalanceDTO
from domain.dto.user_history import CreateUserHistoryDTO
from domain.models import Product
from infrastructure.enums.action import Action
from infrastructure.enums.product_status import ProductStatus
from sqlalchemy.inspection import inspect

from services.exceptions import ProductNotFoundException

logger = logging.getLogger(__name__)


@dataclass
class ProductService(ProductServiceInterface):
    product_repository: ProductRepositoryInterface
    user_repository: UserRepositoryInterface
    push_repository: PushRepositoryInterface
    user_push_repository: UserPushRepositoryInterface
    notification_service: NotificationServiceInterface
    user_history_repository: UserHistoryRepositoryInterface
    increasing_balance_repository: IncreasingBalanceRepositoryInterface

    async def create_product(self, dto: CreateProductDTO) -> UUID:
        await self.product_repository.create(dto)

        await self.user_history_repository.create(CreateUserHistoryDTO(
            user_id=dto.seller_id,
            creator_id=dto.seller_id,
            product_id=dto.id,
            action=Action.PRODUCT_CREATE,
            date=datetime.now(),
            json_before=dto.model_dump(mode="json"),
            json_after=None,
        ))

        update_user = UpdateUserDTO(
            is_seller=True,
        )
        await self.user_repository.update(
            obj_id=dto.seller_id,
            obj=update_user
        )

        return dto.id

    async def get_product(self, product_id: UUID) -> Product:
        return await self.product_repository.get(product_id)

    async def update_product(self, product_id: UUID, dto: UpdateProductDTO, user_id: UUID) -> None:
        # 1. Получаем старый продукт и данные по продавцу
        old = await self.product_repository.get(product_id)
        seller_id = old.seller_id
        user = await self.user_repository.get(seller_id)

        json_before = old.model_dump(mode="json")
        payload = dto.model_dump(exclude_unset=True)
        old_status = old.status
        new_status_candidate = payload.get("status", old_status)

        NON_EDIT_FIELDS = {"status", "remaining_products"}

        product_was_edited = any(
            f not in NON_EDIT_FIELDS and (val is not None) and (val != getattr(old, f, None))
            for f, val in payload.items()
        )

        status_changed_to_archived = (
                "status" in payload
                and new_status_candidate != old_status
                and new_status_candidate == ProductStatus.ARCHIVED
        )

        # 2. Рассчитываем уже зарезервированные раздачи (remaining_products для ACTIVE товаров)
        products = await self.product_repository.get_by_seller(seller_id)
        reserved_active = sum(
            p.remaining_products for p in products
            if p.status == ProductStatus.ACTIVE
        )
        logger.info(f"products: {products}\n\nlol\n\n{', '.join(map(lambda p: f'{p.id}: {p.name}: {p.remaining_products}', products))}")
        # 3. Определяем свободный остаток
        free_credits = user.balance - reserved_active
        logger.info(f"free_credits: {free_credits}, balance: {user.balance}, reserved_active: {reserved_active}")

        # 4. Проверяем, меняются ли только планы раздач (общий или суточный)
        ignored = {'general_repurchases'}
        other_changes = any(
            field not in ignored and value is not None and value != getattr(old, field, None)
            for field, value in dto.model_dump(exclude_unset=True).items()
        )

        # 5. Спецлогика для чистого изменения планов раздач
        if not other_changes and dto.general_repurchases is not None:
            logger.info(f"if")
            if dto.general_repurchases is not None:
                logger.info(f"dto {dto.general_repurchases}")
                logger.info(f"old {old.general_repurchases}")
                delta = dto.general_repurchases - old.general_repurchases
                logger.info(f"delta {delta}")
                dto.remaining_products = old.remaining_products + delta
                if delta > 0:
                    logger.info(f"delta ({delta}) > 0")
                    if free_credits >= delta:
                        logger.info(f"free credits ({free_credits}) >= delta ({delta})")
                        dto.status = ProductStatus.ACTIVE
                        reserved_active += delta
                        free_credits -= delta
                    else:
                        logger.info(f"free credits ({free_credits}) < delta ({delta})")
                        dto.status = ProductStatus.NOT_PAID
                        reserved_active -= old.general_repurchases
                        reserved_active += dto.general_repurchases
                        free_credits += old.general_repurchases
                        free_credits -= dto.general_repurchases
                elif delta < 0:
                    logger.info(f"delta ({delta}) < 0")
                    dto.status = ProductStatus.ACTIVE
                    reserved_active+=delta
                    free_credits-=delta


        # 6. Обычная логика для любых других изменений
        # else:
        #     # 6a. Обновление общего плана
        #     if dto.general_repurchases is not None:
        #         delta = dto.general_repurchases - old.general_repurchases
        #         if delta > 0:
        #             if free_credits < delta:
        #                 dto.status = ProductStatus.NOT_PAID
        #             else:
        #                 await self.user_repository.update(
        #                     obj_id=seller_id,
        #                     obj=UpdateUserDTO(balance=(user.balance or 0) - delta)
        #                 )
        #         elif delta < 0:
        #             change = abs(delta)
        #             await self.user_repository.update(
        #                 obj_id=seller_id,
        #                 obj=UpdateUserDTO(balance=(user.balance or 0) + change)
        #             )
        #         dto.remaining_products = old.remaining_products + delta
        #
        #     # 6b. Обновление суточного плана
        #     if dto.daily_repurchases is not None:
        #         dto.daily_repurchases = dto.daily_repurchases

            # 6c. Дефолтный статус CREATED
        if dto.status is None and old.status in (ProductStatus.DISABLED, ProductStatus.ACTIVE):
            dto.status = ProductStatus.CREATED
        if dto.status == ProductStatus.ACTIVE:
            dto.status = ProductStatus.CREATED

        # 7. Сохраняем изменения и шлём пуш при активации
        await self.product_repository.update(product_id, dto)

        # +++ Получаем "после"
        new = await self.product_repository.get(product_id)
        json_after = new.model_dump(mode="json")

        # +++ Доп.проверка фактической смены на ARCHIVED
        status_changed_to_archived_real = (
                new.status != old_status and new.status == ProductStatus.ARCHIVED
        )

        # +++ Пишем историю
        user_history_repository = get_user_history_repository()
        now = datetime.now()

        if product_was_edited:
            await user_history_repository.create(CreateUserHistoryDTO(
                user_id=new.seller_id,
                creator_id=user_id,
                product_id=product_id,
                action=Action.PRODUCT_CHANGED,
                date=now,
                json_before=json_before,
                json_after=json_after,
            ))

        if status_changed_to_archived or status_changed_to_archived_real:
            await user_history_repository.create(CreateUserHistoryDTO(
                user_id=new.seller_id,
                creator_id=user_id,
                product_id=product_id,
                action=Action.STATUS_CHANGED,
                date=now,
                json_before=json_before,
                json_after=json_after,
            ))

    async def delete_product(self, product_id: UUID) -> None:
        product = await self.product_repository.get(product_id)

        logger.info(f"deleting product {product_id}")

        if not product:
            raise ProductNotFoundException(f"Product with id {product_id} not found")

        logger.info(f"deleting product with status {product.status}")

        if product.status == ProductStatus.ARCHIVED:
            logger.info(f"deleting archive")
            user = await self.user_repository.get(product.seller_id)
            logger.info(f"user: {user.id}")
            if product.remaining_products > 0:
                update_dto = UpdateUserDTO(
                    balance=user.balance + product.remaining_products,
                )
                await self.user_repository.update(product.seller_id, update_dto)
                logger.info(f"user {user.id} updated")

                create_increasing_balance_dto = CreateIncreasingBalanceDTO(
                    user_id=product.seller_id,
                    sum=product.remaining_products,
                )

                await self.increasing_balance_repository.create(create_increasing_balance_dto)

        await self.product_repository.delete(product_id)

    async def get_products(self, limit: int = 100, offset: int = 0) -> List[Product]:
        return await self.product_repository.get_all(limit=limit, offset=offset)

    async def get_by_article(self, article: str) -> Product:
        return await self.product_repository.get_by_article(article)

    async def get_by_seller(self, seller_id: UUID) -> Optional[list[Product]]:
        return await self.product_repository.get_by_seller(seller_id)

    async def get_active_products(self, limit: int = 100, offset: int = 0, search: Optional[str] = None) -> List[
        Product]:
        return await self.product_repository.get_active_products(limit=limit, offset=offset, search=search)
