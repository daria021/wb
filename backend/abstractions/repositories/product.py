from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from abstractions.repositories import CRUDRepositoryInterface
from domain.dto import CreateProductDTO, UpdateProductDTO
from domain.models import Product


class ProductRepositoryInterface(
    CRUDRepositoryInterface[Product, CreateProductDTO, UpdateProductDTO],
    ABC,
):
    # @abstractmethod
    # async def create(self, obj: CreateProductDTO) -> UUID:
    #     ...

    @abstractmethod
    async def get_by_article(self, article: str) -> Optional[Product]:
        ...

    @abstractmethod
    async def get_by_seller(self, seller_id: UUID) -> Optional[list[Product]]:
        ...

    @abstractmethod
    async def get_products_to_review(self) -> list[Product]:
        ...

    @abstractmethod
    async def get_active_products(self, limit: int = 100, offset: int = 9, search: Optional[str] = None) -> list[Product]:
        ...
