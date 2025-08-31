from enum import StrEnum

class Action(StrEnum):
    PRODUCT_CREATE = "product_create" #
    STATUS_CHANGED = "status_changed" #
    PRODUCT_CHANGED = "product_changed" #
    MODERATION_DONE = "moderation_done" #
    MODERATION_FAILED = "moderation_failed" #
    ENDED = "ended" #

    AGREE_TERMS = "agree_terms"
    FIRST_STEP_DONE = "first_step_done"
    SECOND_STEP_DONE = "second_step_done"
    THIRD_STEP_DONE = "third_step_done"
    FOURTH_STEP_DONE = "fourth_step_done"
    FIFTH_STEP_DONE = "fifth_step_done"
    SIXTH_STEP_DONE = "sixth_step_done"
    SEVENTH_STEP_DONE = "seventh_step_done"
    CASHBACK_DONE = "cashback_done"
    CASHBACK_REJECTED = "cashback_rejected"
    REMINDER_SENT = "reminder_sent"