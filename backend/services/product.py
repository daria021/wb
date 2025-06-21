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
        old_product = await self.product_repository.get(product_id)
        logger.info(dto.status)
        logger.info(old_product.status)
        if dto.status is None:
            if (old_product.status == ProductStatus.DISABLED or
                    old_product.status == ProductStatus.ACTIVE):
                dto.status = ProductStatus.CREATED
        await self.product_repository.update(product_id, dto)

        if dto.status == ProductStatus.ACTIVE and old_product.status != ProductStatus.ACTIVE:
            await self.notification_service.send_new_product(product_id=product_id)

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
