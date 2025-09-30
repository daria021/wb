from uuid import uuid4

import pytest

from infrastructure.enums.order_status import OrderStatus
from tests.conftest import (
    FakeOrder, FakeOrderRepo,
    FakeProduct, FakeProductRepo,
    DummyNotification, DummyUserRepo,
)


@pytest.mark.asyncio
async def test_get_user_report_computes_cashback(order_service_factory):
    # Arrange
    order = FakeOrder(
        id=uuid4(),
        product_id=uuid4(),
        user_id=uuid4(),
        seller_id=uuid4(),
        status=OrderStatus.CASHBACK_NOT_PAID,
        step=1,
    )
    product = FakeProduct(
        id=order.product_id,
        seller_id=order.seller_id,
        remaining_products=1,
        status=None, 
        article="ART123",
        price=80.0,
        wb_price=100.0,
    )
    svc = order_service_factory(
        FakeOrderRepo(order),
        FakeProductRepo(product),
        DummyNotification(),
        DummyUserRepo(),
    )

    # Act
    report = await svc.get_user_report(order.id)

    # Assert
    assert report.article == "ART123"
    assert report.cashback == pytest.approx(20.0)


