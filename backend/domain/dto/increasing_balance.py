from typing import Optional
from uuid import UUID

from domain.dto.base import CreateDTO, UpdateDTO


class CreateIncreasingBalanceDTO(CreateDTO):
    user_id: UUID
    sum: int

class UpdateIncreasingBalanceDTO(UpdateDTO):
    user_id: Optional[UUID] = None
    sum: Optional[int] = None

