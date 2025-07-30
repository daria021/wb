from fastapi import APIRouter, Depends

from .auth import router as auth_router
from .moderator import router as moderator_router
from .order import router as orders_router
from .product import router as product_router
from .review import router as review_router
from .user import router as user_router
from .upload import router as upload_router
from .seller_review import router as seller_router
from .deeplink import router as deeplink_router
from .sum import router as sum_router

router = APIRouter(
    prefix="/api",
)

router.include_router(auth_router)
router.include_router(sum_router)
router.include_router(product_router)
router.include_router(review_router)
router.include_router(user_router)
router.include_router(moderator_router)
router.include_router(orders_router)
router.include_router(upload_router)
router.include_router(seller_router)
router.include_router(deeplink_router)

