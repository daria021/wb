export enum PayoutTime {
    AFTER_REVIEW = 'После отзыва',
    AFTER_DELIVERY = 'После получения товара',
    ON_15TH_DAY = 'На 15й день',
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
    MODERATOR = "moderator",
    ADMIN = "admin"
}

export enum ProductStatus {
    CREATED = "created",
    ACTIVE = "active",
    DISABLED = "disabled",
    REJECTED = "rejected",
    ARCHIVED = "archived"
}