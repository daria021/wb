from dataclasses import dataclass
from uuid import uuid4, UUID
import pytest

from domain.dto import UpdateOrderDTO
from infrastructure.enums.order_status import OrderStatus
from infrastructure.enums.product_status import ProductStatus
from infrastructure.enums.user_role import UserRole
from tests.conftest import DummyNotification

@pytest.mark.asyncio
async def test_step5_promotes_seller_to_seller_role(order_factory, order_repo_factory,
                                                    spy_user_repo_user, product_factory, product_repo_factory,
                                                    order_service_factory, patch_history_fake):
    order = order_factory(status=OrderStatus.CASHBACK_NOT_PAID, step=4)
    ord_repo = order_repo_factory(order)
    user_repo = spy_user_repo_user
    prod = product_factory(seller_id=order.seller_id)
    prod_repo = product_repo_factory(prod)

    svc = order_service_factory(ord_repo, prod_repo, DummyNotification(), user_repo, patch_history_fake)

    await svc.update_order(order.id, UpdateOrderDTO(step=5))

    assert any(dto.role == UserRole.SELLER for _, dto in user_repo.updates)

