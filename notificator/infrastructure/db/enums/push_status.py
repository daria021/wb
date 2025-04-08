from enum import StrEnum


class PushStatus(StrEnum):
    PLANNED = 'planned'
    IN_PROGRESS = 'in_progress'
    DELIVERED = 'delivered'
    FAILED = 'failed'
