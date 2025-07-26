import logging
from typing import Iterable, Any

from sqlalchemy import select

from dependencies.repositories.session_maker import get_session_maker
from dependencies.services.order import get_order_service
from infrastructure.entities import Order

logger = logging.getLogger(__name__)

async def backfill() -> bool:
    order_service = get_order_service()
    session = get_session_maker()
    async with session() as session:
        async with session.begin():
            orders_to_backfill: Iterable[Order] = (await session.execute(
                select(Order)
                .where(Order.transaction_code == "0")
            )).scalars().all()

            for order in orders_to_backfill:
                order.transaction_code = await order_service.generate_unique_code()

    return True
