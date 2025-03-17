import logging
from uuid import UUID

from fastapi import APIRouter, Request, HTTPException, status

from dependencies.services.user import get_user_service
from domain.dto import CreateUserDTO, UpdateUserDTO
from routes.requests.user import CreateUserRequest, UpdateUserRequest
from .product import router as product_router
from .order import router as order_router
from ..utils import get_user_id_from_request

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)
router.include_router(product_router)
router.include_router(order_router)

logger = logging.getLogger(__name__)

@router.get("")
async def list_users(request: Request):
    user_service = get_user_service()
    users = await user_service.get_users()  # Метод должен возвращать список пользователей
    return users


@router.get("/me")
async def get_me(request: Request):
    id= get_user_id_from_request(request)
    logger.info("id AAAA")
    logger.info(id)
    return id


@router.get("/{user_id}")
async def get_user(user_id: UUID, request: Request):
    user_service = get_user_service()
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.post("")
async def create_user(request: Request, user_req: CreateUserRequest):
    user_service = get_user_service()
    dto = CreateUserDTO(**user_req.dict())
    user = await user_service.create_user(dto)
    return user

@router.patch("/{user_id}")
async def update_user(user_id: UUID, request: Request, user_req: UpdateUserRequest):
    user_service = get_user_service()
    dto = UpdateUserDTO(**user_req.model_dump(exclude_unset=True))
    await user_service.update_user(user_id, dto)
    return {"message": "User updated successfully"}

@router.delete("/{user_id}")
async def delete_user(user_id: UUID, request: Request):
    user_service = get_user_service()
    await user_service.delete_user(user_id)
    return {"message": "User deleted successfully"}

