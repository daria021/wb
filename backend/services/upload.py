import logging
import os
from dataclasses import dataclass, field
from typing import Annotated
from uuid import uuid4

import aiofiles
from fastapi import UploadFile

from abstractions.services.upload import UploadServiceInterface

logger = logging.getLogger(__name__)

@dataclass
class UploadService(UploadServiceInterface):
    images_dir: str = field(default="/app/upload")

    async def initialize(self) -> None:
        os.makedirs(self.images_dir, exist_ok=True)

    async def upload(self, file: UploadFile) -> str:
        new_filename, new_filepath = self._get_new_file_path(file.filename)
        try:
            async with aiofiles.open(new_filepath, "wb") as f:
                content = await file.read()
                await f.write(content)
            return new_filename
        except Exception:
            logger.error("There was an error while uploading file", exc_info=True)
            raise

    def get_file_path(self, filename: str) -> str:
        return os.path.join(self.images_dir, filename)

    def _get_new_file_path(
            self,
            filename: str,
    ) -> tuple[
        Annotated[str, 'filename'],
        Annotated[str, 'file path'],
    ]:
        new_filename = f"{uuid4()}.{filename.split('.')[-1]}"
        return new_filename, self.get_file_path(new_filename)
