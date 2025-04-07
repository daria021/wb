from abstractions.services import UserServiceInterface
from dependencies.repositories.user import get_user_repository
from dependencies.services.notification import get_notification_service
from services.user import UserService


def get_user_service() -> UserServiceInterface:
    return UserService(
        user_repository=get_user_repository(),
        notification_service=get_notification_service(),
    )
