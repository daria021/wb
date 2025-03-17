from abstractions.services import ReviewServiceInterface
from dependencies.repositories.review import get_review_repository
from services.review import ReviewService


def get_review_service() -> ReviewServiceInterface:
    return ReviewService(
        review_repository=get_review_repository()
    )
