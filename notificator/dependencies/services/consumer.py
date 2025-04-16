from abstractions.services.consumer import ConsumerInterface
from dependencies.repositories.user_push import get_user_push_repository
from dependencies.services.notification import get_notificator
from services.consumer import Consumer


def get_consumer() -> ConsumerInterface:
    return Consumer(
        notification_repository=get_user_push_repository(),
    )
