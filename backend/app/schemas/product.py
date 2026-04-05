from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProductCreate(BaseModel):
    sku: str
    name: str
    description: str | None = None
    unit_price: float
    low_stock_threshold: int = 5
    category_id: int | None = None
    supplier_id: int | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    unit_price: float | None = None
    low_stock_threshold: int | None = None
    is_active: bool | None = None
    category_id: int | None = None
    supplier_id: int | None = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
    description: str | None
    unit_price: float
    low_stock_threshold: int
    is_active: bool
    category_id: int | None = None
    supplier_id: int | None = None
    category_name: str | None = None
    supplier_name: str | None = None
    created_at: datetime
