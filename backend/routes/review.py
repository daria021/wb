import logging
from uuid import UUID

from fastapi import APIRouter, Request

from dependencies.services.review import get_review_service
from domain.dto import CreateReviewDTO, UpdateReviewDTO
from routes.requests.review import CreateReviewRequest, UpdateReviewRequest

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"],
)

logger = logging.getLogger(__name__)


@router.get("")
async def list_reviews(request: Request):
    review_service = get_review_service()
    reviews = await review_service.get_reviews()
    return reviews


@router.get("/{review_id}")
async def get_review(review_id: UUID, request: Request):
    review_service = get_review_service()
    review = await review_service.get_review(review_id)
    return review


@router.post("")
async def create_review(request: Request, review_req: CreateReviewRequest):
    review_service = get_review_service()
    dto = CreateReviewDTO(**review_req.dict())
    review = await review_service.create_review(dto)
    return review


@router.patch("/{review_id}")
async def update_review(review_id: UUID, request: Request, review_req: UpdateReviewRequest):
    review_service = get_review_service()
    dto = UpdateReviewDTO(**review_req.model_dump(exclude_unset=True))
    await review_service.update_review(review_id, dto)
    return {"message": "Review updated successfully"}


@router.delete("/{review_id}")
async def delete_review(review_id: UUID, request: Request):
    review_service = get_review_service()
    await review_service.delete_review(review_id)
    return {"message": "Review deleted successfully"}
