from enum import StrEnum


class UserRole(StrEnum):
    USER = "user"
    CLIENT = "client"
    SELLER = "seller"
    MODERATOR = "moderator"
    ADMIN = "admin"
