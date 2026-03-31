from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProductCreate(BaseModel):
    sku: str
    name: str
    description: str | None = None
    unit_price: float
    low_stock_threshold: int = 5


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    unit_price: float | None = None
    low_stock_threshold: int | None = None
    is_active: bool | None = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
    description: str | None
    unit_price: float
    low_stock_threshold: int
    is_active: bool
    created_at: datetime
