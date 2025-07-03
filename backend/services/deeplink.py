import logging
import uuid
from dataclasses import dataclass
from typing import Optional

from abstractions.repositories.deeplink import DeeplinkRepositoryInterface
from abstractions.services.deeplink import DeeplinkServiceInterface
from domain.dto import CreateDeeplinkDTO
from domain.models import Deeplink

logger = logging.getLogger(__name__)

@dataclass
class DeeplinkService(DeeplinkServiceInterface):
    deeplink_repository: DeeplinkRepositoryInterface

    async def ensure_deeplink(self, path: str) -> Deeplink:
        existing_deeplink = await self.deeplink_repository.get_by_url(path)
        if not existing_deeplink:
            new_deeplink = CreateDeeplinkDTO(
                url=path
            )
            await self.deeplink_repository.create(new_deeplink)
            existing_deeplink = await self.deeplink_repository.get_by_url(path)

        return existing_deeplink

    async def resolve_deeplink(self, key: str) -> Optional[Deeplink]:
        try:
            deeplink_uuid = uuid.UUID(key)
            res = await self.deeplink_repository.get(deeplink_uuid)
            logger.info(f"Deeplink {deeplink_uuid} resolved to {res}")
            return res
        except ValueError:
            logger.warning(f"Could not resolve Deeplink {key}", exc_info=True)
            return None
