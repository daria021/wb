from abc import ABC, abstractmethod
from typing import Optional

from domain.models import Deeplink


class DeeplinkServiceInterface(ABC):
    @abstractmethod
    async def ensure_deeplink(self, path: str) -> Deeplink:
        """
        Ensures that the deeplink exists in the database.
        """
        ...

    @abstractmethod
    async def resolve_deeplink(self, key: str) -> Optional[Deeplink]:
        """
        Resolves a deeplink by its key.
        """
        ...