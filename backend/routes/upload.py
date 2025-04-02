import os

from django.http import FileResponse
from fastapi import APIRouter, Request

from routes.utils import IMAGES_DIR

router = APIRouter(
    prefix="/upload",
    tags=["upload"]
)


@router.get("/{filename}")
async def get_file(
        filename: str,
        request: Request,
) -> FileResponse:
    file_path = os.path.join(IMAGES_DIR, filename)
    return FileResponse(
        path=file_path,
        media_type='application/octet-stream',
        filename=filename
    )
