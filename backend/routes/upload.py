import logging
import os

from fastapi.responses import FileResponse
from fastapi import APIRouter, Depends

from abstractions.services.upload import UploadServiceInterface
from dependencies.services.upload import get_upload_service

router = APIRouter(
    prefix="/upload",
    tags=["upload"]
)

logger = logging.getLogger(__name__)

@router.get("/{filename}")
async def get_file(
        filename: str,
        upload_service: UploadServiceInterface = Depends(get_upload_service),
) -> FileResponse:
    file_path = upload_service.get_file_path(filename)
    return FileResponse(
        path=file_path,
        media_type='application/octet-stream',
        filename=filename
    )
