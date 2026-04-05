from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: float


class OrderCreate(BaseModel):
    warehouse_id: int
    items: list[OrderItemCreate]
    notes: str | None = None


class OrderUpdate(BaseModel):
    notes: str | None = None
    warehouse_id: int | None = None


class OrderStatusUpdate(BaseModel):
    status: str


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    status: str
    warehouse_id: int
    created_by_user_id: int
    notes: str | None = None
    created_at: datetime
    items: list[OrderItemOut] = []
