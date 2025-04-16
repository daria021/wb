from enum import Enum


class ProductStatus(Enum):
    CREATED = "created"
    ACTIVE = "active"
    DISABLED = "disabled"
    REJECTED = "rejected"  # отклонен совсем
    ARCHIVED = "archived"
