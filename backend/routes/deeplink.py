import logging

from fastapi import APIRouter, Request, HTTPException

from dependencies.services.deeplink import get_deeplink_service
from domain.responses.deeplink import DeeplinkResponse

router = APIRouter(
    prefix="/deeplink",
    tags=["Deeplink"],
)

logger = logging.getLogger(__name__)


@router.get("/resolve")
async def get_orders(
        request: Request,
        key: str,
) -> DeeplinkResponse:
    deeplink_service = get_deeplink_service()
    deeplink = await deeplink_service.resolve_deeplink(key)

    if not deeplink:
        raise HTTPException(status_code=404, detail="Deeplink not found")

    return DeeplinkResponse.model_validate(deeplink)
