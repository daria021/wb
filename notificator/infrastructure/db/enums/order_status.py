from enum import StrEnum

class OrderStatus(StrEnum):
    CASHBACK_PAID = "cashback_paid"
    CASHBACK_NOT_PAID = "cashback_not_paid"
    CANCELLED = "cancelled"

