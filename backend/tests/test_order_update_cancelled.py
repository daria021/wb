from uuid import uuid4, UUID
import pytest

from domain.dto import UpdateOrderDTO
from infrastructure.enums.order_status import OrderStatus
from infrastructure.enums.product_status import ProductStatus
from tests.conftest import (
    FakeOrder, FakeOrderRepo,
    FakeProduct, FakeProductRepo,
    DummyNotification,
)
from tests.conftest import (
    FakeOrder, FakeOrderRepo,
    FakeProduct, FakeProductRepo,
    DummyNotification,
)

@pytest.mark.asyncio
async def test_update_order_cancelled_returns_item_to_stock_and_activates_when_archived(
    patch_history_fake, order_service_factory, spy_user_repo
):
    # Arrange
    order = FakeOrder(id=uuid4(), user_id=uuid4(), product_id=uuid4(), seller_id=uuid4(),
                      status=OrderStatus.CASHBACK_NOT_PAID)
    product = FakeProduct(id=uuid4(), seller_id=uuid4(), remaining_products=0, status=ProductStatus.ARCHIVED)
    ord_repo = FakeOrderRepo(order)
    prod_repo = FakeProductRepo(product)
    user_repo = spy_user_repo

    svc = order_service_factory(
        ord_repo,
        prod_repo,
        DummyNotification(),
        user_repo,
        patch_history_fake,
    )

    # Act
    await svc.update_order(order.id, UpdateOrderDTO(status=OrderStatus.CANCELLED))

    # Assert
    assert prod_repo._product.remaining_products == 1
    assert prod_repo._product.status == ProductStatus.ACTIVE


