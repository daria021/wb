from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from abstractions.repositories import CRUDRepositoryInterface
from domain.dto import CreateReviewDTO, UpdateReviewDTO
from domain.models.review import Review


class ReviewRepositoryInterface(
    CRUDRepositoryInterface[Review, CreateReviewDTO, UpdateReviewDTO],
    ABC):

    @abstractmethod
    async def get_reviews_by_product(self, product_id: UUID) -> List[Review]:
        ...
