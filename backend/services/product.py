import logging
from dataclasses import dataclass
from typing import List, Optional
from uuid import UUID

from abstractions.repositories import ProductRepositoryInterface, UserRepositoryInterface
from abstractions.repositories.push import PushRepositoryInterface
from abstractions.repositories.user_push import UserPushRepositoryInterface
from abstractions.services import ProductServiceInterface
from abstractions.services.notification import NotificationServiceInterface
from domain.dto import CreateProductDTO, UpdateProductDTO, UpdateUserDTO
from domain.models import Product
from infrastructure.enums.product_status import ProductStatus

logger = logging.getLogger(__name__)


@dataclass
class ProductService(ProductServiceInterface):
    product_repository: ProductRepositoryInterface
    user_repository: UserRepositoryInterface
    push_repository: PushRepositoryInterface
    user_push_repository: UserPushRepositoryInterface
    notification_service: NotificationServiceInterface

    async def create_product(self, dto: CreateProductDTO) -> UUID:
        await self.product_repository.create(dto)
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

    async def update_product(self, product_id: UUID, dto: UpdateProductDTO) -> None:
        # 1. Получаем старый продукт и данные по продавцу
        old = await self.product_repository.get(product_id)
        seller_id = old.seller_id
        user = await self.user_repository.get(seller_id)

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


    async def delete_product(self, product_id: UUID) -> None:
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
