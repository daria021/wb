from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from abstractions.repositories import CRUDRepositoryInterface
from domain.dto.moderator_review import CreateModeratorReviewDTO, UpdateModeratorReviewDTO
from domain.models.moderator_review import ModeratorReview


class ModeratorReviewRepositoryInterface(
    CRUDRepositoryInterface[ModeratorReview, CreateModeratorReviewDTO, UpdateModeratorReviewDTO],
    ABC,
):
    @abstractmethod
    async def get_by_user(self, user_id: UUID) -> List[ModeratorReview]:
        ...
