import os
import sys
from dataclasses import dataclass
from uuid import uuid4
import pytest

ROOT = os.path.dirname(os.path.dirname(__file__)) 
PROJ = os.path.dirname(ROOT)
if PROJ not in sys.path:
    sys.path.insert(0, PROJ)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from backend.infrastructure.enums.product_status import ProductStatus
from backend.infrastructure.enums.order_status import OrderStatus
from backend.infrastructure.enums.user_role import UserRole


@dataclass
class FakeOrder:
    id: str
    user_id: str
    product_id: str
    seller_id: str
    status: OrderStatus
    step: int = 1

    def model_dump(self, mode: str = "json"):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "product_id": self.product_id,
            "seller_id": self.seller_id,
            "status": self.status,
            "step": self.step,
        }


@dataclass
class FakeProduct:
    id: str
    seller_id: str
    remaining_products: int
    status: ProductStatus
    article: str | None = None
    price: float | None = None
    wb_price: float | None = None

    def model_dump(self, mode: str = "json"):
        return {
            "id": self.id,
            "seller_id": self.seller_id,
            "remaining_products": self.remaining_products,
            "status": self.status,
            "article": self.article,
            "price": self.price,
            "wb_price": self.wb_price,
        }


class FakeOrderRepo:
    def __init__(self, order: FakeOrder, return_copy: bool = False):
        self._order = order
        self.return_copy = return_copy
        self.created: list = []
        self.codes: set[str] = set()

    async def get(self, _):
        if not self.return_copy:
            return self._order
        return FakeOrder(
            id=self._order.id,
            user_id=self._order.user_id,
            product_id=self._order.product_id,
            seller_id=self._order.seller_id,
            status=self._order.status,
            step=self._order.step,
        )

    async def update(self, _oid, dto):
        if getattr(dto, "status", None) is not None:
            self._order.status = dto.status
        if getattr(dto, "step", None) is not None:
            self._order.step = dto.step

    async def create(self, dto):
        self.created.append(dto)

    async def exists_by_code(self, code: str) -> bool:
        return code in self.codes


class FakeProductRepo:
    def __init__(self, product: FakeProduct):
        self._product = product
        self.updated = []

    async def get(self, _):
        return self._product

    async def update(self, _pid, dto):
        if getattr(dto, "remaining_products", None) is not None:
            self._product.remaining_products = dto.remaining_products
        if getattr(dto, "status", None) is not None:
            self._product.status = dto.status
        self.updated.append(dto)


class DummyNotification:
    async def send_order_progress_reminder(self, *_):
        pass
    async def send_cashback_paid(self, *_):
        pass
    async def send_cashback_rejected(self, *_):
        pass


class SpyNotification:
    def __init__(self):
        self.paid = []
        self.rejected = []

    async def send_cashback_paid(self, order_id):
        self.paid.append(order_id)

    async def send_cashback_rejected(self, order_id):
        self.rejected.append(order_id)

    async def send_order_progress_reminder(self, *_):
        pass


class DummyUserRepo:
    async def get(self, _):
        return None
    async def update(self, *_):
        return None


class SpyUserRepo:
    def __init__(self):
        self.updates = []

    async def get(self, _):
        return type("U", (), {"role": None, "id": uuid4()})()

    async def update(self, uid, dto):
        self.updates.append((uid, dto))


class SpyHistory:
    def __init__(self):
        self.actions = []

    async def create(self, dto):
        self.actions.append(dto.action)


class FakeUserHistoryRepo:
    async def create(self, *_args, **_kwargs):
        return None


@pytest.fixture
def order_factory():
    def _make(status: OrderStatus = OrderStatus.CASHBACK_NOT_PAID, step: int = 1,
              user_id=None, product_id=None, seller_id=None) -> FakeOrder:
        return FakeOrder(
            id=str(uuid4()),
            user_id=str(user_id or uuid4()),
            product_id=str(product_id or uuid4()),
            seller_id=str(seller_id or uuid4()),
            status=status,
            step=step,
        )
    return _make


@pytest.fixture
def product_factory():
    def _make(remaining: int = 1, status: ProductStatus = ProductStatus.ACTIVE,
              seller_id=None, article=None, price=None, wb_price=None) -> FakeProduct:
        return FakeProduct(
            id=str(uuid4()),
            seller_id=str(seller_id or uuid4()),
            remaining_products=remaining,
            status=status,
            article=article,
            price=price,
            wb_price=wb_price,
        )
    return _make


@pytest.fixture
def order_repo_factory():
    def _make(order: FakeOrder, return_copy: bool = False) -> FakeOrderRepo:
        return FakeOrderRepo(order, return_copy=return_copy)
    return _make


@pytest.fixture
def product_repo_factory():
    def _make(product: FakeProduct) -> FakeProductRepo:
        return FakeProductRepo(product)
    return _make


@pytest.fixture
def dummy_notification():
    return DummyNotification()


@pytest.fixture
def spy_notification():
    return SpyNotification()


@pytest.fixture
def dummy_user_repo():
    return DummyUserRepo()


@pytest.fixture
def spy_user_repo():
    return SpyUserRepo()


@pytest.fixture
def spy_history():
    return SpyHistory()


@pytest.fixture
def spy_user_repo_user(spy_user_repo):
    async def _get(_):
        return type("U", (), {"role": UserRole.USER, "id": uuid4()})()
    spy_user_repo.get = _get
    return spy_user_repo


@pytest.fixture
def patch_history_spy(monkeypatch, spy_history):
    from backend.services import order as order_module
    monkeypatch.setattr(order_module, "get_user_history_repository", lambda: spy_history, raising=False)
    return spy_history


@pytest.fixture
def patch_history_fake(monkeypatch):
    from backend.services import order as order_module
    fake = FakeUserHistoryRepo()
    monkeypatch.setattr(order_module, "get_user_history_repository", lambda: fake, raising=False)
    return fake


@pytest.fixture
def order_service_factory():
    from backend.services.order import OrderService
    def _make(order_repo, product_repo, notification, user_repo, user_history_repo=None, unique_code: str | None = None) -> OrderService:
        if user_history_repo is None:
            user_history_repo = FakeUserHistoryRepo()
        svc = OrderService(
            order_repository=order_repo,
            product_repository=product_repo,
            notification_service=notification,
            user_repository=user_repo,
            user_history_repository=user_history_repo,
        )
        if unique_code is not None:
            async def _fixed_code() -> str:
                return unique_code
        
            setattr(svc, "generate_unique_code", _fixed_code)
        return svc
    return _make

