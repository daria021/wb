from uuid import uuid4

import pytest

from domain.dto import CreateOrderDTO
from infrastructure.enums.product_status import ProductStatus


@pytest.mark.asyncio
async def test_create_order_out_of_stock_raises(order_service_factory, product_factory, product_repo_factory,
                                                order_repo_factory, order_factory,
                                                dummy_notification, dummy_user_repo, patch_history_fake):
    product = product_factory(remaining=0, status=ProductStatus.ACTIVE)
    prod_repo = product_repo_factory(product)
    ord_repo = order_repo_factory(order_factory(status=None, step=0))
    svc = order_service_factory(ord_repo, prod_repo, dummy_notification, dummy_user_repo)

    dto = CreateOrderDTO(user_id=uuid4(), product_id=uuid4(), seller_id=uuid4(), step=0)

    with pytest.raises(Exception):
        await svc.create_order(dto)


@pytest.mark.asyncio
async def test_create_order_happy_path_decrements_and_archives_on_zero(order_service_factory,
                                                                       product_factory, product_repo_factory,
                                                                       order_repo_factory, order_factory,
                                                                       dummy_notification, dummy_user_repo, patch_history_fake):
    product = product_factory(remaining=1, status=ProductStatus.ACTIVE)
    prod_repo = product_repo_factory(product)
    ord_repo = order_repo_factory(order_factory(status=None, step=0))

    svc = order_service_factory(
        ord_repo,
        prod_repo,
        dummy_notification,
        dummy_user_repo,
        unique_code="ABC123",
    )

    dto = CreateOrderDTO(user_id=uuid4(), product_id=uuid4(), seller_id=uuid4(), step=0)

    await svc.create_order(dto)

    assert len(ord_repo.created) == 1
    assert prod_repo._product.remaining_products == 0
    assert prod_repo._product.status == ProductStatus.ARCHIVED
