from enum import StrEnum

class PayoutTime(StrEnum):
    AFTER_REVIEW = "После публикации отзыва на WB"
    AFTER_DELIVERY = "После получения товара"
    ON_15TH_DAY = "Через 15 дней получения товара"
