from enum import StrEnum

class PayoutTime(StrEnum):
    AFTER_REVIEW = "После отзыва"
    AFTER_DELIVERY = "После получения товара"
    ON_15TH_DAY = "На 15й день"
