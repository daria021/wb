from abc import ABC

from abstractions.repositories import CRUDRepositoryInterface
from domain.dto.moderator_review import CreateModeratorReviewDTO, UpdateModeratorReviewDTO
from domain.models.moderator_review import ModeratorReview


class ModeratorReviewRepositoryInterface(
    CRUDRepositoryInterface[ModeratorReview, CreateModeratorReviewDTO, UpdateModeratorReviewDTO],
    ABC,
):
    ...
