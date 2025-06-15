from abc import ABC, abstractmethod
from typing import Optional

from abstractions.repositories import CRUDRepositoryInterface
from domain.dto import CreateDeeplinkDTO, UpdateDeeplinkDTO
from domain.models import Deeplink


class DeeplinkRepositoryInterface(
    CRUDRepositoryInterface[Deeplink, CreateDeeplinkDTO, UpdateDeeplinkDTO],
    ABC,
):
    @abstractmethod
    async def get_by_url(self, url: str) -> Optional[Deeplink]:
        ...
