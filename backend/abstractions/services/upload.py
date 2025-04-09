from abc import ABC, abstractmethod

from fastapi import UploadFile


class UploadServiceInterface(ABC):
    @abstractmethod
    async def upload(self, image: UploadFile) -> str:
        ...

    @abstractmethod
    def get_file_path(self, filename: str) -> str:
        ...

    @abstractmethod
    async def initialize(self) -> None:
        ...
