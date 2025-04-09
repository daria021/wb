import os
from dataclasses import field, dataclass

from abstractions.services.upload import UploadServiceInterface


@dataclass
class UploadService(UploadServiceInterface):
    images_dir: str = field(default="/app/upload")

    def get_filepath(self, filename: str) -> str:
        return os.path.join(self.images_dir, filename)
