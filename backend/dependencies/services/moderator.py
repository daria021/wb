from abstractions.services.moderator import ModeratorServiceInterface
from dependencies.repositories.moderator_review import get_moderator_review_repository
from dependencies.repositories.product import get_product_repository
from dependencies.services.user import get_user_service
from services.moderator import ModeratorService


def get_moderator_service() -> ModeratorServiceInterface:
    return ModeratorService(
        products_repository=get_product_repository(),
        user_service=get_user_service(),
        moderator_review_repository=get_moderator_review_repository(),
    )
