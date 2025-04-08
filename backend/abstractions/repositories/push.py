from abc import ABC, abstractmethod

from abstractions.repositories import CRUDRepositoryInterface
from domain.dto import CreatePushDTO, UpdatePushDTO
from domain.models import Push


class PushRepositoryInterface(
    CRUDRepositoryInterface[Push, CreatePushDTO, UpdatePushDTO],
    ABC,
):
    ...
