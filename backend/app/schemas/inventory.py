from datetime import datetime

from pydantic import BaseModel


class StockAdjustRequest(BaseModel):
    product_id: int
    warehouse_id: int
    change: int
    reason: str


class StockTransferRequest(BaseModel):
    product_id: int
    from_warehouse_id: int
    to_warehouse_id: int
    quantity: int


class InventoryOut(BaseModel):
    id: int
    product_id: int
    warehouse_id: int
    quantity: int
    updated_at: datetime


class LowStockItem(BaseModel):
    product_id: int
    sku: str
    product_name: str
    warehouse_id: int
    quantity: int
    threshold: int
