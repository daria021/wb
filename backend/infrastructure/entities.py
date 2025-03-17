from datetime import datetime
from typing import Optional, List
from uuid import UUID as pyUUID

from sqlalchemy import DateTime, ForeignKey, UUID, BigInteger, Enum
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship

from infrastructure.enums.category import Category
from infrastructure.enums.payout_time import PayoutTime

Base = declarative_base()


class AbstractBase(Base):
    __abstract__ = True

    id: Mapped[pyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)


class Product(AbstractBase):
    __tablename__ = "products"

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
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="product")
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="product")
    seller_id: Mapped[pyUUID] = mapped_column(ForeignKey("users.id"), default=False)


class User(AbstractBase):
    __tablename__ = "users"

    telegram_id: Mapped[Optional[int]] = mapped_column(BigInteger, unique=True)
    nickname: Mapped[Optional[str]]
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="user")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="user")




class Order(AbstractBase):
    __tablename__ = "orders"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    product_id: Mapped[UUID] = mapped_column(ForeignKey("products.id"))
    card_number: Mapped[str]
    screenshot_path: Mapped[str]
    status: Mapped[str]
    user: Mapped["User"] = relationship("User", back_populates="orders")
    product: Mapped["Product"] = relationship("Product", back_populates="orders")


class Review(AbstractBase):
    __tablename__ = "reviews"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    product_id: Mapped[UUID] = mapped_column(ForeignKey("products.id"))
    rating: Mapped[int]
    comment: Mapped[str]

    user: Mapped["User"] = relationship("User", back_populates="reviews")
    product: Mapped["Product"] = relationship("Product", back_populates="reviews")
