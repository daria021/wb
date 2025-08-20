from abstractions.services.moderator import ModeratorServiceInterface
from dependencies.repositories.increasing_balance import get_increasing_balance_repository
from dependencies.repositories.moderator_review import get_moderator_review_repository
from dependencies.repositories.product import get_product_repository
from dependencies.services.notification import get_notification_service
from dependencies.services.user import get_user_service
from services.moderator import ModeratorService


def get_moderator_service() -> ModeratorServiceInterface:
    return ModeratorService(
        products_repository=get_product_repository(),
        user_service=get_user_service(),
        moderator_review_repository=get_moderator_review_repository(),
        notification_service=get_notification_service(),
        increasing_balance_repository=get_increasing_balance_repository()
    )
