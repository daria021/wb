from abstractions.services.deeplink import DeeplinkServiceInterface
from dependencies.repositories.deeplink import get_deeplink_repository
from services.deeplink import DeeplinkService


def get_deeplink_service() -> DeeplinkServiceInterface:
    return DeeplinkService(
        deeplink_repository=get_deeplink_repository(),
    )
