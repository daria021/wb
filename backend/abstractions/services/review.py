from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from domain.dto.review import CreateReviewDTO, UpdateReviewDTO
from domain.models.review import Review


class ReviewServiceInterface(ABC):
    @abstractmethod
    async def create_review(self, review_dto: CreateReviewDTO) -> Review:
        """
        Добавляет новый отзыв и возвращает его доменную модель.
        """
        ...

    @abstractmethod
    async def get_review(self, review_id: UUID) -> Review:
        """
        Добавляет новый отзыв и возвращает его доменную модель.
        """
        ...
    @abstractmethod
    async def get_reviews(self) -> list[Review]:
        """
        Добавляет новый отзыв и возвращает его доменную модель.
        """
        ...

    @abstractmethod
    async def update_review(self, review_id: UUID, update_dto: UpdateReviewDTO) -> None:
        """
        Обновляет отзыв с заданным ID.
        """
        ...

    @abstractmethod
    async def delete_review(self, review_id: UUID) -> None:
        """
        Удаляет отзыв с заданным ID.
        """
        ...

    @abstractmethod
    async def list_reviews_by_product(self, product_id: UUID) -> List[Review]:
        """
        Возвращает список отзывов для указанного продукта.
        """
        ...
