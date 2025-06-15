from typing import Optional

from domain.dto.base import CreateDTO, UpdateDTO


class CreateDeeplinkDTO(CreateDTO):
    url: str


class UpdateDeeplinkDTO(UpdateDTO):
    url: Optional[str] = None
