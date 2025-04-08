from datetime import datetime
from typing import Optional, List
from uuid import UUID as pyUUID

from sqlalchemy import DateTime, ForeignKey, UUID, BigInteger, Enum
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship

from infrastructure.db.enums import Category, OrderStatus, PayoutTime, ProductStatus, UserRole
from infrastructure.db.enums.push_status import PushStatus

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
    daily_repurchases: Mapped[int]
    price: Mapped[float]
    wb_price: Mapped[float]
    tg: Mapped[str]
    payment_time: Mapped[PayoutTime] = mapped_column(Enum(PayoutTime))
    review_requirements: Mapped[str]
    image_path: Mapped[Optional[str]]
    seller_id: Mapped[pyUUID] = mapped_column(ForeignKey('users.id'))
    status: Mapped[ProductStatus] = mapped_column(Enum(ProductStatus), default=ProductStatus.CREATED)

    reviews: Mapped[List['Review']] = relationship('Review', back_populates='product')
    orders: Mapped[List['Order']] = relationship('Order', back_populates='product')
    moderator_reviews: Mapped[list['ModeratorReview']] = relationship('ModeratorReview', back_populates='product')


class User(AbstractBase):
    __tablename__ = 'users'

    telegram_id: Mapped[Optional[int]] = mapped_column(BigInteger, unique=True)
    nickname: Mapped[Optional[str]]
    role: Mapped[UserRole] = mapped_column(Enum(UserRole))
    is_banned: Mapped[bool]
    is_seller: Mapped[bool]
    balance: Mapped[Optional[int]]
    user_orders: Mapped[List["Order"]] = relationship("Order", foreign_keys="Order.user_id")
    seller_orders: Mapped[List["Order"]] = relationship("Order", foreign_keys="Order.seller_id")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="user")


class Order(AbstractBase):
    __tablename__ = 'orders'

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    product_id: Mapped[UUID] = mapped_column(ForeignKey("products.id"))
    seller_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))

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

    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default="CASHBACK_NOT_PAID")

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="user_orders")
    seller: Mapped["User"] = relationship("User", foreign_keys=[seller_id], back_populates="seller_orders")
    product: Mapped["Product"] = relationship("Product", foreign_keys=[product_id], back_populates="orders")


class Review(AbstractBase):
    __tablename__ = 'reviews'

    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'))
    product_id: Mapped[UUID] = mapped_column(ForeignKey('products.id'))
    rating: Mapped[int]
    comment: Mapped[str]

    user: Mapped['User'] = relationship('User', back_populates='reviews')
    product: Mapped['Product'] = relationship('Product', back_populates='reviews')


class ModeratorReview(AbstractBase):
    __tablename__ = 'moderator_reviews'
    
    moderator_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'))
    product_id: Mapped[UUID] = mapped_column(ForeignKey('products.id'))
    comment: Mapped[str]
    status_before: Mapped[ProductStatus]
    status_after: Mapped[ProductStatus]

    moderator: Mapped['User'] = relationship('User')
    product: Mapped['Product'] = relationship('Product', back_populates='moderator_reviews')

class Push(AbstractBase):
    __tablename__ = 'pushes'
    title: Mapped[str] = mapped_column(unique=True)
    text: Mapped[str]
    creator_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'))
    image_path: Mapped[Optional[str]] = mapped_column(unique=False)

    creator: Mapped["User"] = relationship("User", foreign_keys=[creator_id])

class UserPush(AbstractBase):
    __tablename__ = 'user_pushes'

    push_id: Mapped[UUID] = mapped_column(ForeignKey('pushes.id'))
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'))
    sent_at: Mapped[Optional[datetime]]
    status: Mapped[PushStatus]

    push: Mapped["Push"] = relationship("Push")
    user: Mapped["User"] = relationship("User", foreign_keys=[push_id])
