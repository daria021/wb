from dataclasses import dataclass
from typing import List
from uuid import UUID

from abstractions.repositories import ReviewRepositoryInterface
from abstractions.services import ReviewServiceInterface
from domain.dto import CreateReviewDTO, UpdateReviewDTO
from domain.models import Review


@dataclass
class ReviewService(ReviewServiceInterface):
    review_repository: ReviewRepositoryInterface

    async def create_review(self, dto: CreateReviewDTO) -> None:
        return await self.review_repository.create(dto)

    async def get_review(self, review_id: UUID) -> Review:
        return await self.review_repository.get(review_id)

    async def update_review(self, review_id: UUID, dto: UpdateReviewDTO) -> None:
        await self.review_repository.update(review_id, dto)

    async def delete_review(self, review_id: UUID) -> None:
        await self.review_repository.delete(review_id)

    async def get_reviews(self, limit: int = 100, offset: int = 0) -> List[Review]:
        return await self.review_repository.get_all(limit=limit, offset=offset)

    async def list_reviews_by_product(self, product_id: UUID) -> List[Review]:
        return await self.review_repository.get_reviews_by_product(product_id=product_id)


