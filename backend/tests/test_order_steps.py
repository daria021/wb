from dataclasses import dataclass
from uuid import uuid4, UUID
import pytest

from domain.dto import UpdateOrderDTO
from infrastructure.enums.action import Action
from infrastructure.enums.order_status import OrderStatus
from infrastructure.enums.product_status import ProductStatus
from tests.conftest import (
    FakeOrder, FakeOrderRepo,
    FakeProduct, FakeProductRepo,
    DummyUserRepo, SpyHistory,
)
from services.order import OrderService


@pytest.mark.asyncio
async def test_update_order_writes_step_action(order_repo_factory):
    # Arrange
    order = FakeOrder(
        id=uuid4(),
        user_id=uuid4(),
        product_id=uuid4(),
        seller_id=uuid4(),
        status=OrderStatus.CASHBACK_NOT_PAID,
        step=1,
    )
    ord_repo = order_repo_factory(order, return_copy=True)
    product = FakeProduct(id=uuid4(), seller_id=order.seller_id, remaining_products=1, status=ProductStatus.ACTIVE)
    prod_repo = FakeProductRepo(product)
    user_repo = DummyUserRepo()
    spy = SpyHistory()

    svc = OrderService(
        order_repository=ord_repo,
        product_repository=prod_repo,
        notification_service=None,
        user_repository=user_repo,
        user_history_repository=spy
    )

    # Act
    await svc.update_order(order.id, UpdateOrderDTO(step=2))

    # Assert
    assert Action.SECOND_STEP_DONE in spy.actions
