from datetime import datetime

from pydantic import BaseModel


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    warehouse_id: int
    items: list[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    status: str


class OrderOut(BaseModel):
    id: int
    order_number: str
    status: str
    warehouse_id: int
    created_at: datetime
