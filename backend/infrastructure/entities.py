from datetime import datetime
from typing import Optional, List
from uuid import UUID as pyUUID

from sqlalchemy import DateTime, ForeignKey, UUID, BigInteger, Enum, text
from sqlalchemy.dialects.postgresql import TSVECTOR, JSONB
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from infrastructure.enums.action import Action
from infrastructure.enums.category import Category
from infrastructure.enums.order_status import OrderStatus
from infrastructure.enums.payout_time import PayoutTime
from infrastructure.enums.product_status import ProductStatus
from infrastructure.enums.push_status import PushStatus
from infrastructure.enums.user_role import UserRole

Base = declarative_base()


class AbstractBase(Base):
    __abstract__ = True

    id: Mapped[pyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)


class Product(AbstractBase):
    __tablename__ = 'products'

    name: Mapped[str]
    brand: Mapped[str]
    article: Mapped[str] = mapped_column(unique=True)
    category: Mapped[Category] = mapped_column(Enum(Category))
    key_word: Mapped[str]
    general_repurchases: Mapped[int]
    remaining_products: Mapped[int]
    # daily_repurchases: Mapped[int]
    price: Mapped[float]
    wb_price: Mapped[float]
    tg: Mapped[str]
    payment_time: Mapped[PayoutTime] = mapped_column(Enum(PayoutTime))
    review_requirements: Mapped[str]
    requirements_agree: Mapped[bool]
    image_path: Mapped[Optional[str]]
    seller_id: Mapped[pyUUID] = mapped_column(ForeignKey('users.id'))
    status: Mapped[ProductStatus] = mapped_column(Enum(ProductStatus), default=ProductStatus.CREATED)

    reviews: Mapped[List['Review']] = relationship('Review', back_populates='product', passive_deletes=True)
    orders: Mapped[List['Order']] = relationship('Order', back_populates='product', passive_deletes=True)
    moderator_reviews: Mapped[list['ModeratorReview']] = relationship(
        'ModeratorReview',
        order_by="ModeratorReview.created_at",
        back_populates='product',
        passive_deletes=True,
    )
    search_vector: Mapped[str] = mapped_column(
        TSVECTOR(),
        nullable=True,
    )

    deleted_at: Mapped[Optional[datetime]]


class User(AbstractBase):
    __tablename__ = 'users'

    telegram_id: Mapped[Optional[int]] = mapped_column(BigInteger, unique=True)
    nickname: Mapped[Optional[str]]
    phone_number: Mapped[Optional[str]]
    role: Mapped[UserRole] = mapped_column(Enum(UserRole))
    is_banned: Mapped[bool]
    is_seller: Mapped[bool]
    balance: Mapped[Optional[int]]
    invited_by: Mapped[Optional[pyUUID]] = mapped_column(ForeignKey('users.id'))
    has_discount: Mapped[Optional[bool]]
    referrer_bonus: Mapped[Optional[int]]

    inviter: Mapped[Optional['User']] = relationship('User', foreign_keys=[invited_by], remote_side='User.id')
    user_orders: Mapped[List["Order"]] = relationship("Order", foreign_keys="Order.user_id")
    seller_orders: Mapped[List["Order"]] = relationship("Order", foreign_keys="Order.seller_id")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="user")


class Order(AbstractBase):
    __tablename__ = 'orders'

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    product_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"))
    seller_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    transaction_code: Mapped[str] = mapped_column(server_default="0")
    # Чтобы отслеживать, на каком шаге сейчас заказ
    step: Mapped[int] = mapped_column(default=1)

    # Шаг 1: скриншоты
    search_screenshot_path: Mapped[Optional[str]]
    cart_screenshot_path: Mapped[Optional[str]]

    # Шаг 4: реквизиты
    card_number: Mapped[Optional[str]]
    phone_number: Mapped[Optional[str]]
    name: Mapped[Optional[str]]
    bank: Mapped[Optional[str]]

    # Шаг 5: финальный скрин корзины
    final_cart_screenshot_path: Mapped[Optional[str]]

    # Шаг 6: скрин доставки, скрин штрихкодов
    delivery_screenshot_path: Mapped[Optional[str]]
    barcodes_screenshot_path: Mapped[Optional[str]]

    # Шаг 7: скрин отзывов, скрин электронного чека, номер чека
    review_screenshot_path: Mapped[Optional[str]]
    receipt_screenshot_path: Mapped[Optional[str]]
    receipt_number: Mapped[Optional[str]]

    order_date: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("'1970-01-01 00:00:00'")
    )
    # Дата фактической выплаты кешбэка
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default="CASHBACK_NOT_PAID")

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="user_orders")
    seller: Mapped["User"] = relationship("User", foreign_keys=[seller_id], back_populates="seller_orders")
    product: Mapped["Product"] = relationship(
        "Product",
        foreign_keys=[product_id],
        back_populates="orders",
    )


class Review(AbstractBase):
    __tablename__ = 'reviews'

    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'))
    product_id: Mapped[UUID] = mapped_column(ForeignKey('products.id', ondelete="CASCADE"))
    rating: Mapped[int]
    comment: Mapped[str]

    user: Mapped['User'] = relationship('User', back_populates='reviews')
    product: Mapped['Product'] = relationship('Product', back_populates='reviews')


class ModeratorReview(AbstractBase):
    __tablename__ = 'moderator_reviews'

    moderator_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'))
    product_id: Mapped[UUID] = mapped_column(ForeignKey('products.id', ondelete="CASCADE"))
    comment_to_seller: Mapped[Optional[str]]
    comment_to_moderator: Mapped[Optional[str]]
    status_before: Mapped[ProductStatus]
    status_after: Mapped[ProductStatus]

    moderator: Mapped['User'] = relationship('User')
    product: Mapped['Product'] = relationship('Product', back_populates='moderator_reviews')


class Push(AbstractBase):
    __tablename__ = 'pushes'

    title: Mapped[str] = mapped_column(unique=True)
    text: Mapped[str]
    creator_id: Mapped[pyUUID] = mapped_column(ForeignKey('users.id'))
    image_path: Mapped[Optional[str]]

    button_text: Mapped[Optional[str]]
    button_link: Mapped[Optional[str]]

    deleted_at: Mapped[Optional[datetime]]

    creator: Mapped["User"] = relationship("User", foreign_keys=[creator_id])


class UserPush(AbstractBase):
    __tablename__ = 'user_pushes'

    push_id: Mapped[pyUUID] = mapped_column(ForeignKey('pushes.id'))
    user_id: Mapped[pyUUID] = mapped_column(ForeignKey('users.id'))
    sent_at: Mapped[Optional[datetime]]
    status: Mapped[PushStatus]

    push: Mapped["Push"] = relationship("Push")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])


class SellerReview(AbstractBase):
    __tablename__ = "seller_reviews"

    seller_id: Mapped[pyUUID] = mapped_column(ForeignKey('users.id'))
    sender_id: Mapped[pyUUID] = mapped_column(ForeignKey('users.id'))
    rating: Mapped[int]
    review: Mapped[Optional[str]]

    seller: Mapped["User"] = relationship("User", foreign_keys=[seller_id])
    sender: Mapped["User"] = relationship("User", foreign_keys=[sender_id])


class Deeplink(AbstractBase):
    __tablename__ = 'deeplinks'

    url: Mapped[str]


class IncreasingBalance(AbstractBase):
    __tablename__ = 'increasing_balances'
    user_id: Mapped[pyUUID] = mapped_column(ForeignKey('users.id'))
    sum: Mapped[int]


class UserHistory(AbstractBase):
    __tablename__ = 'user_history'

    user_id: Mapped[pyUUID] = mapped_column(ForeignKey('users.id'))
    product_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey('products.id', ondelete="SET NULL"))
    creator_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey('users.id'))
    action: Mapped[Action]  # опубликовался в каталог, заархивирован, отредактирован
    date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now()  # БД подставит текущее "локальное" время
    )
    json_before: Mapped[Optional[dict]] = mapped_column(JSONB)
    json_after: Mapped[Optional[dict]] = mapped_column(JSONB)
