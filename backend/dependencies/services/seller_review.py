from abstractions.services.seller_review import SellerReviewServiceInterface
from dependencies.repositories.seller_review import get_seller_review_repository
from dependencies.repositories.user import get_user_repository
from dependencies.repositories.order import get_order_repository
from services.seller_review import SellerReviewService


def get_seller_review_service() -> SellerReviewServiceInterface:
    return SellerReviewService(
        seller_review_repository=get_seller_review_repository(),
        seller_repository=get_user_repository(),
        order_repository=get_order_repository(),
    )