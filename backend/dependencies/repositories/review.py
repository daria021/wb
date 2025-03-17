from abstractions.repositories import ReviewRepositoryInterface
from dependencies.repositories.session_maker import get_session_maker
from infrastructure.repositories.review import ReviewRepository


def get_review_repository() -> ReviewRepositoryInterface:
    return ReviewRepository(
        session_maker=get_session_maker()
    )