import logging
import os

from fastapi.responses import FileResponse
from fastapi import APIRouter

from routes.utils import IMAGES_DIR

router = APIRouter(
    prefix="/upload",
    tags=["upload"]
)

logger = logging.getLogger(__name__)

@router.get("/{filename}")
async def get_file(
        filename: str,
) -> FileResponse:
    file_path = os.path.join(IMAGES_DIR, filename)
    return FileResponse(
        path=file_path,
        media_type='application/octet-stream',
        filename=filename
    )
