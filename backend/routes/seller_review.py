from uuid import UUID

from dependencies.services.seller_review import get_seller_review_service
from domain.dto.seller_review import CreateSellerReviewDTO, UpdateSellerReviewDTO
from fastapi import APIRouter, Request, HTTPException
from routes.requests.seller_review import SellerReviewRequest
from routes.utils import get_user_id_from_request
from services.exceptions import NoSuchEntity

router = APIRouter(
    prefix="/seller_review",
    tags=["seller_review"]
)


@router.get("")
async def list_seller_reviews(request: Request):
    seller_review_service = get_seller_review_service()
    seller_reviews = await seller_review_service.get_seller_reviews()
    return seller_reviews


@router.get("/seller")
async def get_seller_reviews_by_seller(seller_nickname: str, request: Request):
    seller_review_service = get_seller_review_service()
    try:
        seller_reviews = await seller_review_service.get_seller_reviews_by_seller(seller_nickname)
        return seller_reviews
    except NoSuchEntity:
        raise HTTPException(
            status_code=404,
            detail="No such seller"
        )


@router.post("")
async def create_seller_review(request: Request, seller_review_req: SellerReviewRequest):
    seller_review_service = get_seller_review_service()
    sender_id = get_user_id_from_request(request)
    try:
        seller_review = await seller_review_service.create_seller_review(seller_review_req, sender_id)
        return seller_review

    except NoSuchEntity:
        raise HTTPException(
            status_code=404,
            detail="No such seller"
        )



@router.patch("/{seller_review_id}")
async def update_seller_review(seller_review_id: UUID, request: Request, seller_review_req: UpdateSellerReviewDTO):
    seller_review_service = get_seller_review_service()
    dto = UpdateSellerReviewDTO(**seller_review_req.model_dump(exclude_unset=True))
    await seller_review_service.update_seller_review(seller_review_id, dto)
    return {"message": "seller_review updated successfully"}


@router.delete("/{seller_review_id}")
async def delete_seller_review(seller_review_id: UUID, request: Request):
    seller_review_service = get_seller_review_service()
    await seller_review_service.delete_seller_review(seller_review_id)
    return {"message": "seller_review deleted successfully"}
