from fastapi import APIRouter

from .products import router as products_router
from .users import router as users_router
from .push import router as pushes_router

router = APIRouter(
    prefix='/moderator',
    tags=['Moderator']
)

router.include_router(products_router)
router.include_router(users_router)
router.include_router(pushes_router)
