from abc import ABC, abstractmethod
from uuid import UUID


class CRUDRepositoryInterface[Model, CreateDTO, UpdateDTO](ABC):
    @abstractmethod
    async def create(self, obj: CreateDTO) -> None:
        pass

    @abstractmethod
    async def get(self, obj_id: UUID) -> Model:
        pass

    @abstractmethod
    async def update(self, obj_id: UUID, obj: UpdateDTO) -> None:
        pass

    @abstractmethod
    async def delete(self, obj_id: UUID) -> None:
        pass

    @abstractmethod
    async def get_all(self, limit: int = 100, offset: int = 0) -> list[Model]:
        pass
