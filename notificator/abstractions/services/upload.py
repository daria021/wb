from abc import ABC, abstractmethod


class UploadServiceInterface(ABC):
    @abstractmethod
    def get_filepath(self, filename: str) -> str:
        ...
