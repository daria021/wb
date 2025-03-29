from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from domain.dto.product import CreateProductDTO, UpdateProductDTO
from domain.models.product import Product


class ProductServiceInterface(ABC):
    @abstractmethod
    async def create_product(self, dto: CreateProductDTO) -> UUID:
        """Создать новый товар и вернуть его модель."""
        ...

    @abstractmethod
    async def get_product(self, product_id: UUID) -> Product:
        """Получить данные товара по его идентификатору."""
        ...

    @abstractmethod
    async def update_product(self, product_id: UUID, dto: UpdateProductDTO) -> None:
        """Обновить данные товара."""
        ...

    @abstractmethod
    async def delete_product(self, product_id: UUID) -> None:
        """Удалить товар."""
        ...

    @abstractmethod
    async def get_products(self, limit: int = 100, offset: int = 0) -> List[Product]:
        """Вернуть список товаров с пагинацией."""
        ...

    @abstractmethod
    async def get_by_article(self, article: str) -> Product:
        ...

    @abstractmethod
    async def get_by_seller(self, seller_id: UUID) -> Optional[list[Product]]:
        ...

    @abstractmethod
    async def get_active_products(self, limit: int = 100, offset: int = 0) -> list[Product]:
        ...
