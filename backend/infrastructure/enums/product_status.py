from enum import Enum


class ProductStatus(Enum):
    CREATED = "created"
    ACTIVE = "active"
    NOT_PAID = "not_paid"
    DISABLED = "disabled"
    REJECTED = "rejected"  # отклонен совсем
    ARCHIVED = "archived"
