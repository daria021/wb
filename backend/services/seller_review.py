import logging
from dataclasses import dataclass
from typing import List
from uuid import UUID

from abstractions.repositories import ReviewRepositoryInterface, UserRepositoryInterface
from abstractions.repositories.seller_review import SellerReviewRepositoryInterface
from abstractions.services.seller_review import SellerReviewServiceInterface
from domain.dto import CreateReviewDTO, UpdateReviewDTO
from domain.dto.seller_review import CreateSellerReviewDTO, UpdateSellerReviewDTO
from domain.models import Review
from domain.models.seller_review import SellerReview
from routes.requests.seller_review import SellerReviewRequest
from services.exceptions import NoSuchEntity

logger = logging.getLogger(__name__)


@dataclass
class SellerReviewService(SellerReviewServiceInterface):
    seller_review_repository: SellerReviewRepositoryInterface
    seller_repository: UserRepositoryInterface

    async def create_seller_review(self, seller_review_req: SellerReviewRequest, sender_id: UUID) -> None:
        seller = await self.seller_repository.get_by_nickname(seller_review_req.seller_nickname)
        if not seller:
            raise NoSuchEntity
        dto = CreateSellerReviewDTO(
            seller_id=seller.id,
            sender_id=sender_id,
            review=seller_review_req.review,
        )
        logger.info("AAAAAAAAAAAAAA dto")
        logger.info(dto)
        return await self.seller_review_repository.create(dto)

    async def get_seller_review(self, review_id: UUID) -> SellerReview:
        return await self.seller_review_repository.get(review_id)

    async def get_seller_reviews_by_seller(self, seller_nickname: str) -> list[SellerReview]:
        seller = await self.seller_repository.get_by_nickname(seller_nickname)
        if not seller:
            raise NoSuchEntity
        return await self.seller_review_repository.get_seller_reviews_by_seller(seller.id)

    async def update_seller_review(self, seller_review_id: UUID, dto: UpdateSellerReviewDTO) -> None:
        await self.seller_review_repository.update(seller_review_id, dto)

    async def delete_seller_review(self, seller_review_id: UUID) -> None:
        await self.seller_review_repository.delete(seller_review_id)

    async def get_seller_reviews(self, limit: int = 100, offset: int = 0) -> List[SellerReview]:
        return await self.seller_review_repository.get_all(limit=limit, offset=offset)
