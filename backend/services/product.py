from dataclasses import dataclass
from typing import List, Optional
from uuid import UUID

from abstractions.repositories import ProductRepositoryInterface
from abstractions.services import ProductServiceInterface
from domain.dto import CreateProductDTO, UpdateProductDTO
from domain.models import Product


@dataclass
class ProductService(ProductServiceInterface):
    product_repository: ProductRepositoryInterface

    async def create_product(self, dto: CreateProductDTO) -> UUID:
        await self.product_repository.create(dto)
        return dto.id

    async def get_product(self, product_id: UUID) -> Product:
        return await self.product_repository.get(product_id)

    async def update_product(self, product_id: UUID, dto: UpdateProductDTO) -> None:
        await self.product_repository.update(product_id, dto)

    async def delete_product(self, product_id: UUID) -> None:
        await self.product_repository.delete(product_id)

    async def get_products(self, limit: int = 100, offset: int = 0) -> List[Product]:
        return await self.product_repository.get_all(limit=limit, offset=offset)

    async def get_by_article(self, article: str) -> Product:
        return await self.product_repository.get_by_article(article)

    async def get_by_seller(self, seller_id: UUID) -> Optional[list[Product]]:
        return await self.product_repository.get_by_seller(seller_id)
