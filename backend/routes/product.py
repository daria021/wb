import logging
from typing import Optional, Annotated
from uuid import UUID

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Depends

from abstractions.services.upload import UploadServiceInterface
from dependencies.services.product import get_product_service  # функция, возвращающая экземпляр ProductService
from dependencies.services.upload import get_upload_service
from dependencies.services.user_context import get_me_cached
from domain.dto import CreateProductDTO, UpdateProductDTO
from domain.dto.user_with_balance import UserWithBalanceDTO
from domain.models import Product
from domain.responses.product import ProductResponse
from infrastructure.enums.category import Category
from infrastructure.enums.payout_time import PayoutTime
from infrastructure.enums.product_status import ProductStatus
from routes.requests.update_product import UpdateProductForm
from routes.utils import get_user_id_from_request

router = APIRouter(
    prefix="/products",
    tags=["Products"],
)

logger = logging.getLogger(__name__)


@router.get("")
async def get_products(
        request: Request,
        search: Optional[str] = None,
):
    product_service = get_product_service()
    products = await product_service.get_active_products(search=search)
    return products


@router.get("/article")
async def get_by_article(article: str) -> Product:
    product_service = get_product_service()
    return await product_service.get_by_article(article)

@router.get("/user/{user_id}")
async def get_by_user(user_id: UUID) -> list[Product]:
    product_service = get_product_service()
    return await product_service.get_by_seller(user_id)

# @router.get("/seller")
# async def get_by_seller(
#         request: Request,
# ) -> Optional[list[Product]]:
#     product_service = get_product_service()
#     seller_id = get_user_id_from_request(request)
#     return await product_service.get_by_seller(seller_id)

@router.get("/seller")
async def get_by_seller(
        me: UserWithBalanceDTO = Depends(get_me_cached),
        product_service=Depends(get_product_service),
) -> dict:  # todo: убью
    """
    Ответ содержит:
      - free_balance: сколько ещё свободно
      - reserved_active: сколько занято активными
      - unpaid_plan: сколько в NOT_PAID
      - total_plan: reserved_active + unpaid_plan
      - products: список продуктов
      """

    logger.info("me!!!")
    logger.info(me)
    prods = await product_service.get_by_seller(me.id)
    return {
        "free_balance": me.free_balance,
        "reserved_active": me.reserved_active,
        "unpaid_plan": me.unpaid_plan,
        "total_plan": me.total_plan,
        "products": prods,
    }


@router.get("/{product_id}")
async def get_product(
        product_id: UUID,
) -> ProductResponse:
    product_service = get_product_service()
    product = await product_service.get_product(product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    response = ProductResponse.model_validate(product)
    if product.moderator_reviews:
        response.last_moderator_review = product.moderator_reviews[-1]  # todo

    return response


@router.post("")
async def create_product(
        request: Request,
        name: str = Form(...),
        article: str = Form(...),
        brand: str = Form(...),
        category: Category = Form(...),
        key_word: str = Form(...),
        general_repurchases: int = Form(...),
        # daily_repurchases: int = Form(...),
        price: float = Form(..., gt=0),
        wb_price: float = Form(...),
        tg: str = Form(...),
        payment_time: PayoutTime = Form(...),
        review_requirements: str = Form(...),
        requirements_agree: bool = Form(...),
        image: Optional[UploadFile] = File(None),
        upload_service: UploadServiceInterface = Depends(get_upload_service),
        always_show: bool = Form(False),
) -> UUID:
    logger.info(f"Create product: {name}")
    seller_id = get_user_id_from_request(request)
    image_path = None

    dto = CreateProductDTO(
        name=name,
        brand=brand,
        category=category,
        key_word=key_word,
        general_repurchases=general_repurchases,
        remaining_products=general_repurchases,
        # daily_repurchases=daily_repurchases,
        price=price,
        wb_price=wb_price,
        tg=tg,
        payment_time=payment_time,
        review_requirements=review_requirements,
        requirements_agree=requirements_agree,
        article=article,
        image_path=image_path,
        always_show=always_show,
        seller_id=seller_id
    )

    if image is not None:
        try:
            image_path = await upload_service.upload(image)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Не удалось сохранить файл"
            ) from e
    else:
        logger.error("ATTENTION!!! IMAGE IS NONE")

    dto.image_path = image_path

    product_service = get_product_service()
    product_id = await product_service.create_product(dto)

    return product_id


@router.patch("/{product_id}")
async def update_product(
        request: Request,
        product_id: UUID,
        data: Annotated[UpdateProductForm, Form()],
        upload_service: UploadServiceInterface = Depends(get_upload_service),
) -> dict:
    user_id=get_user_id_from_request(request)

    update_dto = UpdateProductDTO.model_validate(data.model_dump(exclude_unset=True))
    # dto = UpdateProductDTO(
    #     name=data.name,
    #     brand=brand,
    #     category=category,
    #     key_word=key_word,
    #     general_repurchases=general_repurchases,
    #     daily_repurchases=daily_repurchases,
    #     price=price,
    #     wb_price=wb_price,
    #     tg=tg,
    #     payment_time=payment_time,
    #     status=status,
    #     review_requirements=review_requirements,
    #     article=article,
    # )

    if data.image is not None:
        try:
            image_path = await upload_service.upload(data.image)
            update_dto.image_path = image_path
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(
                status_code=500,
                detail="Не удалось сохранить файл"
            ) from e

    product_service = get_product_service()
    await product_service.update_product(product_id, update_dto, user_id)
    return {"message": "Product updated successfully"}


@router.patch("/status/{product_id}")
async def update_product_status(
        request: Request,
        product_id: UUID,
        status: Optional[ProductStatus] = Form(...),
) -> dict:
    dto = UpdateProductDTO(
        status=status,
    )
    user_id=get_user_id_from_request(request)

    product_service = get_product_service()
    await product_service.update_product(product_id, dto, user_id)
    return {"message": "Product updated successfully"}


@router.delete("/{product_id}")
async def delete_product(product_id: UUID):
    logger.info(f"Delete product: {product_id}")
    product_service = get_product_service()
    await product_service.delete_product(product_id)
    return {"message": "Product deleted successfully"}
