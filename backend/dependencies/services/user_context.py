import logging

from fastapi import Request, Depends

from dependencies.services.order import get_order_service
from dependencies.services.user import get_user_service
from dependencies.services.product import get_product_service
from domain.dto.user_with_balance import UserWithBalanceDTO
from infrastructure.enums.product_status import ProductStatus
from routes.utils import get_user_id_from_request

logger = logging.getLogger(__name__)
async def get_me_cached(
    request: Request,
    user_svc=Depends(get_user_service),
    prod_svc=Depends(get_product_service),
    ords_svc=Depends(get_order_service),
) -> UserWithBalanceDTO:
    if not hasattr(request.state, "me"):
        uid = get_user_id_from_request(request)
        user = await user_svc.get_user(uid)
        prods = await prod_svc.get_by_seller(uid)

        reserved_active = sum(
            p.remaining_products for p in prods
            if p.status == ProductStatus.ACTIVE
        )
        logger.info(f"Reserved products: {reserved_active}")
        unpaid_plan = sum(
            p.remaining_products for p in prods
            if p.status == ProductStatus.NOT_PAID
        )
        logger.info(f"Unpaid products: {unpaid_plan}")

        total_plan = reserved_active + unpaid_plan
        logger.info(reserved_active)
        logger.info(unpaid_plan)
        free_balance = user.balance - sum(
            p.general_repurchases for p in prods
            if p.status == ProductStatus.ACTIVE
        )
        logger.debug(
            f"Before normalization: balance={user.balance}, "
            f"reserved_active={reserved_active}, unpaid_plan={unpaid_plan}, "
            f"free_balance={free_balance}"
        )
        # 3. Нормализация баланса: гарантируем free_balance >= 0
        # Сортируем оплаченные товары (ACTIVE) по дате (или id) от самых свежих
        paid_prods = sorted(
            (p for p in prods if p.status == ProductStatus.ACTIVE),
            key=lambda p: getattr(p, "created_at", None) or p.id,
            reverse=True
        )
        idx = 0
        while free_balance < 0 and idx < len(paid_prods):
            prod = paid_prods[idx]
            idx += 1
            prod.status = ProductStatus.NOT_PAID
            logger.info(f"Normalize: marking product {prod.id} as NOT_PAID")

            # Возвращаем пользователю remaining_products
            free_balance += prod.remaining_products
            unpaid_plan += prod.remaining_products

            # Корректируем общие и зарезервированные
            total_plan -= prod.general_repurchases
            reserved_active -= prod.general_repurchases

        if free_balance < 0:
            # После попытки обработки всех paid_prods баланс всё ещё отрицателен
            logger.error(
                f"Balance normalization incomplete for user {uid}: "
                f"free_balance still {free_balance}, setting to 0"
            )
            free_balance = 0

        logger.debug(
            f"After normalization: reserved_active={reserved_active}, "
            f"unpaid_plan={unpaid_plan}, total_plan={total_plan}, "
            f"free_balance={free_balance}"
        )

        in_progress = len(await ords_svc.get_in_progress_orders_by_seller(uid))
        # 4. Сборка DTO
        request.state.me = UserWithBalanceDTO(
            **user.model_dump(),
            total_plan=total_plan,
            reserved_active=reserved_active,
            unpaid_plan=unpaid_plan,
            free_balance=free_balance,
            in_progress=in_progress
        )

    return request.state.me
