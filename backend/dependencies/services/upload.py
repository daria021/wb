from abstractions.services.upload import UploadServiceInterface
from services.upload import UploadService


def get_upload_service() -> UploadServiceInterface:
    return UploadService(

    )
