import logging
from uuid import UUID

from fastapi import APIRouter, Request, HTTPException, Form, Depends

from dependencies.services.user import get_user_service
from dependencies.services.user_context import get_me_cached
from domain.dto import CreateUserDTO, UpdateUserDTO
from domain.dto.user_with_balance import UserWithBalanceDTO
from domain.models import User
from routes.requests.user import CreateUserRequest, UpdateUserRequest
from .order import router as order_router
from .product import router as product_router
from ..utils import get_user_id_from_request

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)
router.include_router(product_router)
router.include_router(order_router)

logger = logging.getLogger(__name__)


# todo: все ручки кроме get /me - в модераторский роутер и в модераторский сервис
@router.get("")
async def list_users(request: Request):
    user_service = get_user_service()
    users = await user_service.get_users()
    return users

@router.get("/sellers")
async def list_sellers(request: Request):
    user_service = get_user_service()
    users = await user_service.get_sellers()
    return users

# @router.get("/me")
# async def get_me(request: Request) -> User:
#     user_id = get_user_id_from_request(request)
#     logger.info("id AAAA")
#     logger.info(user_id)
#     user_service = get_user_service()
#     user = await user_service.get_user(user_id)
#     return user

@router.get("/me")
async def get_me(
    me: UserWithBalanceDTO = Depends(get_me_cached)
) -> UserWithBalanceDTO:
    return me

@router.get("/invite")
async def get_invite_link(request: Request):
    user_service = get_user_service()
    user_id = get_user_id_from_request(request)

    link = await user_service.get_invite_link(user_id)

    return link


@router.get("/{user_id}")
async def get_user(user_id: UUID, request: Request):
    user_service = get_user_service()
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

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


@router.patch("/balance/{user_id}")
async def increase_balance(
        request: Request,
        user_id: UUID,
        balance: int = Form(...),
):
    user_service = get_user_service()
    await user_service.increase_balance(user_id, balance)


@router.get("/balance/{user_id}")
async def get_balance(request: Request):
    user_service = get_user_service()
    user = await user_service.get_user(get_user_id_from_request(request))
    return user.balance
