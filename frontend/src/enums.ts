export enum PayoutTime {
    AFTER_REVIEW = 'После публикации отзыва на WB',
    AFTER_DELIVERY = 'После получения товара',
    ON_15TH_DAY = 'Через 15 дней получения товара',
}

export enum Category {
    WOMEN = 'Женщинам',
    MEN = 'Мужчинам',
    SHOES = 'Обувь',
    KIDS = 'Детям',
    HOME = 'Дом',
    NEW_YEAR = 'Новый год',
    BEAUTY = 'Красота',
    ACCESSORIES = 'Аксессуары',
    ELECTRONICS = 'Электроника',
    TOYS = 'Игрушки',
    FURNITURE = 'Мебель',
    ADULT = 'Товары для взрослых',
    APPLIANCES = 'Бытовая техника',
    PETS = 'Зоотовары',
    SPORTS = 'Спорт',
    AUTO = 'Автотовары',
    JEWELRY = 'Ювелирные изделия',
    REPAIR = 'Для ремонта',
    GARDEN = 'Сад и дача',
    HEALTH = 'Здоровье',
    STATIONERY = 'Канцтовары',
}

export enum UserRole {
    USER = "user",
    CLIENT = "client",
    SELLER = "seller",
    MODERATOR = "moderator",
    ADMIN = "admin"
}

export enum ProductStatus {
    CREATED = "created",
    ACTIVE = "active",
    NOT_PAID = "not_paid",
    DISABLED = "disabled",
    REJECTED = "rejected",
    ARCHIVED = "archived",
}

export enum OrderStatus {
    CASHBACK_PAID = "cashback_paid",
    CASHBACK_NOT_PAID = "cashback_not_paid",
    CANCELLED = "cancelled",
    PAYMENT_CONFIRMED = "payment_confirmed",
    CASHBACK_REJECTED = "cashback_rejected"
}