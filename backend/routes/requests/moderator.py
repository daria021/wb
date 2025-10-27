from typing import Optional

from pydantic import BaseModel, Field

from infrastructure.enums.product_status import ProductStatus


class UpdateProductStatusRequest(BaseModel):
    status: Optional[ProductStatus] = None
    comment_to_seller: Optional[str] = Field(None, validation_alias="commentSeller")
    comment_to_moderator: Optional[str] = Field(None, validation_alias="commentModerator")
    always_show: Optional[bool] = None
