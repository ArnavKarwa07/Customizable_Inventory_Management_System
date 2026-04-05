from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_scope
from app.database.models import Order, OrderItem, Product, User
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate, OrderUpdate
from app.services.audit_service import log_action

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=list[OrderOut])
def list_orders(user: User = Depends(require_scope("orders:read")), db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.org_id == user.org_id).order_by(Order.id.desc()).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, user: User = Depends(require_scope("orders:read")), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.org_id == user.org_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    user: User = Depends(require_scope("orders:create")),
    db: Session = Depends(get_db),
):
    order = Order(
        org_id=user.org_id,
        order_number=f"ORD-{uuid4().hex[:10].upper()}",
        warehouse_id=payload.warehouse_id,
        created_by_user_id=user.id,
        notes=payload.notes,
        status="draft",
    )
    db.add(order)
    db.flush()

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id, Product.org_id == user.org_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item.product_id} not found")
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=product.unit_price,
            )
        )

    log_action(db, user, "create", "order", None, f"Created order: {order.order_number}")
    db.commit()
    db.refresh(order)
    return order


@router.patch("/{order_id}", response_model=OrderOut)
def update_order(
    order_id: int,
    payload: OrderUpdate,
    user: User = Depends(require_scope("orders:update")),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id, Order.org_id == user.org_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if payload.notes is not None:
        order.notes = payload.notes
    if payload.warehouse_id is not None:
        order.warehouse_id = payload.warehouse_id

    log_action(db, user, "update", "order", order_id, f"Updated order: {order.order_number}")
    db.commit()
    db.refresh(order)
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    user: User = Depends(require_scope("orders:update")),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id, Order.org_id == user.org_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = payload.status
    log_action(db, user, "status_change", "order", order_id, f"{order.order_number} → {payload.status}")
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    order_id: int,
    user: User = Depends(require_scope("orders:delete")),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id, Order.org_id == user.org_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.status != "draft":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only draft orders can be deleted")

    log_action(db, user, "delete", "order", order_id, f"Deleted order: {order.order_number}")
    db.delete(order)
    db.commit()
