from typing import Optional

from pydantic import BaseModel

from infrastructure.enums.product_status import ProductStatus


class UpdateProductStatusRequest(BaseModel):
    status: Optional[ProductStatus] = None
    comment: Optional[str] = None
