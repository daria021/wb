from abc import ABC, abstractmethod
from uuid import UUID

from abstractions.repositories import CRUDRepositoryInterface
from domain.dto.seller_review import UpdateSellerReviewDTO, CreateSellerReviewDTO
from domain.models.seller_review import SellerReview


class SellerReviewRepositoryInterface(
    CRUDRepositoryInterface[SellerReview, CreateSellerReviewDTO, UpdateSellerReviewDTO],
    ABC):

    @abstractmethod
    async def get_seller_reviews_by_seller(self, seller_id: UUID) -> list[SellerReview]:
        ...

