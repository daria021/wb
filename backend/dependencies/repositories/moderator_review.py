from abstractions.repositories.moderator_review import ModeratorReviewRepositoryInterface
from dependencies.repositories.session_maker import get_session_maker
from infrastructure.repositories.moderator_review import ModeratorReviewRepository


def get_moderator_review_repository() -> ModeratorReviewRepositoryInterface:
    return ModeratorReviewRepository(
        session_maker=get_session_maker(),
    )
