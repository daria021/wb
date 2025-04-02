from typing import Optional
from uuid import UUID

from fastapi import Request

IMAGES_DIR = "/app/upload"

def get_user_id_from_request(request: Request) -> Optional[UUID]:
    return request.scope.get('x_user_id', None)
