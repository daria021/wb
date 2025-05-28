from abc import ABC, abstractmethod
from uuid import UUID

from domain.dto.seller_review import UpdateSellerReviewDTO
from domain.models.seller_review import SellerReview
from routes.requests.seller_review import SellerReviewRequest


class SellerReviewServiceInterface(ABC):
    @abstractmethod
    async def create_seller_review(self, seller_review_req: SellerReviewRequest, sender_id: UUID) -> SellerReview:
        """
        Добавляет новый отзыв и возвращает его доменную модель.
        """
        ...

    @abstractmethod
    async def get_seller_review(self, seller_review_id: UUID) -> SellerReview:
        """
        Добавляет новый отзыв и возвращает его доменную модель.
        """
        ...

    @abstractmethod
    async def get_seller_reviews_by_seller(self, seller_nickname: str) -> list[SellerReview]:
        """
        Добавляет новый отзыв и возвращает его доменную модель.
        """
        ...

    @abstractmethod
    async def get_seller_reviews(self) -> list[SellerReview]:
        """
        Добавляет новый отзыв и возвращает его доменную модель.
        """
        ...

    @abstractmethod
    async def update_seller_review(self, seller_review_id: UUID, update_dto: UpdateSellerReviewDTO) -> None:
        """
        Обновляет отзыв с заданным ID.
        """
        ...

    @abstractmethod
    async def delete_seller_review(self, seller_review_id: UUID) -> None:
        """
        Удаляет отзыв с заданным ID.
        """
        ...



