import logging
import os
from typing import Optional
from uuid import UUID

import aiofiles
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from starlette import status

from dependencies.services.product import get_product_service  # функция, возвращающая экземпляр ProductService
from domain.dto import CreateProductDTO, UpdateProductDTO
from domain.models import Product
from domain.responses.product import ProductResponse
from infrastructure.enums.category import Category
from infrastructure.enums.payout_time import PayoutTime
from infrastructure.enums.product_status import ProductStatus
from routes.utils import get_user_id_from_request

router = APIRouter(
    prefix="/products",
    tags=["Products"],
)

logger = logging.getLogger(__name__)

IMAGES_DIR = "/app/upload"
os.makedirs(IMAGES_DIR, exist_ok=True)


@router.get("")
async def get_products(request: Request):
    product_service = get_product_service()
    products = await product_service.get_active_products()  # Метод должен возвращать список продуктов
    return products


@router.get("/article")
async def get_by_article(article: str) -> Product:
    product_service = get_product_service()
    return await product_service.get_by_article(article)


@router.get("/seller")
async def get_by_seller(
        request: Request,
) -> Optional[list[Product]]:
    product_service = get_product_service()
    # seller_id = UUID('16dae60f-67dc-4957-b27b-b432b6045384')
    seller_id = get_user_id_from_request(request)
    return await product_service.get_by_seller(seller_id)


@router.get("/{product_id}")
async def get_product(
        product_id: UUID,
        # request: Request,
) -> ProductResponse:
    product_service = get_product_service()
    product = await product_service.get_product(product_id)

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    response = ProductResponse.model_validate(product)
    if product.moderator_reviews:
        response.last_moderator_review = product.moderator_reviews[-1] #todo

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
        daily_repurchases: int = Form(...),
        price: float = Form(..., gt=0),
        wb_price: float = Form(...),
        tg: str = Form(...),
        payment_time: PayoutTime = Form(...),
        review_requirements: str = Form(...),
        image: Optional[UploadFile] = File(None)
) -> UUID:
    # seller_id = UUID('16dae60f-67dc-4957-b27b-b432b6045384')
    seller_id = get_user_id_from_request(request)
    image_path = None

    # Если файл изображения передан, сохраняем его и задаем путь
    if image is not None:
        upload_dir = IMAGES_DIR
        os.makedirs(upload_dir, exist_ok=True)
        file_location = os.path.join(upload_dir, image.filename)
        try:
            async with aiofiles.open(file_location, "wb") as file_obj:
                await file_obj.write(await image.read())
            image_path = image.filename
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Не удалось сохранить файл"
            ) from e

    dto = CreateProductDTO(
        name=name,
        brand=brand,
        category=category,
        key_word=key_word,
        general_repurchases=general_repurchases,
        daily_repurchases=daily_repurchases,
        price=price,
        wb_price=wb_price,
        tg=tg,
        payment_time=payment_time,
        review_requirements=review_requirements,
        article=article,
        image_path=image_path,
        seller_id=seller_id
    )

    product_service = get_product_service()
    product_id = await product_service.create_product(dto)

    return product_id


@router.patch("/{product_id}")
async def update_product(
        product_id: UUID,
        request: Request,
        name: Optional[str] = Form(...),
        article: Optional[str] = Form(...),
        brand: Optional[str] = Form(...),
        category: Optional[Category] = Form(...),
        key_word: Optional[str] = Form(...),
        general_repurchases: Optional[int] = Form(...),
        daily_repurchases: Optional[int] = Form(...),
        price: Optional[float] = Form(..., gt=0),
        wb_price: Optional[float] = Form(...),
        tg: Optional[str] = Form(...),
        status: Optional[ProductStatus] = Form(...),
        payment_time: Optional[PayoutTime] = Form(...),
        review_requirements: Optional[str] = Form(...),
        image: Optional[UploadFile] = File(None),
) -> dict:
    # Если файл изображения передан, сохраняем его и задаем путь
    image_path = None
    if image is not None:
        upload_dir = IMAGES_DIR  # IMAGES_DIR определён ранее (например, "static/images")
        os.makedirs(upload_dir, exist_ok=True)
        file_location = os.path.join(upload_dir, image.filename)
        try:
            async with aiofiles.open(file_location, "wb") as file_obj:
                await file_obj.write(await image.read())
            image_path = image.filename
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Не удалось сохранить файл"
            ) from e

    # Формируем DTO для обновления
    dto = UpdateProductDTO(
        name=name,
        brand=brand,
        category=category,
        key_word=key_word,
        general_repurchases=general_repurchases,
        daily_repurchases=daily_repurchases,
        price=price,
        wb_price=wb_price,
        tg=tg,
        payment_time=payment_time,
        status=status,
        review_requirements=review_requirements,
        article=article,
        image_path=image_path  # Если image_path не обновляется, можно оставить его как None
        # seller_id можно не обновлять, если оно не меняется
    )

    product_service = get_product_service()
    await product_service.update_product(product_id, dto)
    return {"message": "Product updated successfully"}


@router.patch("/status/{product_id}")
async def update_product_status(
        product_id: UUID,
        request: Request,
        status: Optional[ProductStatus] = Form(...),
) -> dict:
    dto = UpdateProductDTO(
        status=status,
    )

    product_service = get_product_service()
    await product_service.update_product(product_id, dto)
    return {"message": "Product updated successfully"}


@router.delete("/{product_id}")
async def delete_product(product_id: UUID, request: Request):
    product_service = get_product_service()
    await product_service.delete_product(product_id)
    return {"message": "Product deleted successfully"}
