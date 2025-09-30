from dataclasses import dataclass
from uuid import uuid4
import pytest

from domain.dto import UpdateOrderDTO
from infrastructure.enums.order_status import OrderStatus
from infrastructure.enums.product_status import ProductStatus
from tests.conftest import (
    FakeOrder, FakeOrderRepo,
    FakeProduct, FakeProductRepo,
    SpyNotification,
    SpyUserRepo, SpyHistory,
)
from services.order import OrderService

@pytest.mark.asyncio
async def test_cashback_paid_sends_notification_and_sets_role(monkeypatch):
    order = FakeOrder(id=str(uuid4()), user_id=str(uuid4()), product_id=str(uuid4()), seller_id=str(uuid4()),
                      status=OrderStatus.CASHBACK_NOT_PAID, step=1)
    ord_repo = FakeOrderRepo(order)
    product = FakeProduct(id=uuid4(), seller_id=uuid4(), remaining_products=1, status=ProductStatus.ACTIVE)
    prod_repo = FakeProductRepo(product)
    notif = SpyNotification()
    user_repo = SpyUserRepo()
    history = SpyHistory()

    svc = OrderService(
        order_repository=ord_repo,
        product_repository=prod_repo,
        notification_service=notif,
        user_repository=user_repo,
        user_history_repository=history,
    )

    await svc.update_order(order.id, UpdateOrderDTO(status=OrderStatus.CASHBACK_PAID))

    assert order.status == OrderStatus.CASHBACK_PAID
    assert notif.paid == [order.id]
    assert len(user_repo.updates) >= 1


@pytest.mark.asyncio
async def test_cashback_rejected_sends_notification(monkeypatch):
    order = FakeOrder(id=str(uuid4()), user_id=str(uuid4()), product_id=str(uuid4()), seller_id=str(uuid4()),
                      status=OrderStatus.CASHBACK_NOT_PAID, step=1)
    ord_repo = FakeOrderRepo(order)
    product = FakeProduct(id=uuid4(), seller_id=uuid4(), remaining_products=1, status=ProductStatus.ACTIVE)
    prod_repo = FakeProductRepo(product)
    notif = SpyNotification()
    user_repo = SpyUserRepo()
    history = SpyHistory()

    svc = OrderService(order_repository=ord_repo, product_repository=prod_repo,
                       notification_service=notif, user_repository=user_repo, user_history_repository=history)

    await svc.update_order(order.id, UpdateOrderDTO(status=OrderStatus.CASHBACK_REJECTED))

    assert order.status == OrderStatus.CASHBACK_REJECTED
    assert notif.rejected == [order.id]


