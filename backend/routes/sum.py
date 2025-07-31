from fastapi import APIRouter, Depends

from dependencies.services.order import get_order_service
from dependencies.services.product import get_product_service
from dependencies.services.user_context import get_me_cached

router = APIRouter(prefix="", tags=["Init"])

@router.get("/init")
async def init(
    me = Depends(get_me_cached),
    product_service = Depends(get_product_service),
    order_service   = Depends(get_order_service),
):
    # получаем первую страницу товаров (ваша реализация get_products возвращает Product[])
    products = await product_service.get_products()
    # список заказов текущего пользователя
    orders   = await order_service.get_orders_by_user(me.id)
    # возвращаем всё в одном запросе
    return {
        "me":       me,
        "products": products,
        "orders":   orders,
    }
