from abstractions.repositories.seller_review import SellerReviewRepositoryInterface
from dependencies.repositories.session_maker import get_session_maker
from infrastructure.repositories.seller_review import SellerReviewRepository


def get_seller_review_repository() -> SellerReviewRepositoryInterface:
    return SellerReviewRepository(
        session_maker=get_session_maker()
    )