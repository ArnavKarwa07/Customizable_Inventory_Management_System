from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_roles
from app.database.models import Order, OrderItem, Product, User
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=list[OrderOut])
def list_orders(_user: User = Depends(require_roles("admin", "manager", "staff")), db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.id.desc()).all()


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _ = require_roles("admin", "manager", "staff")(current_user)

    order = Order(
        order_number=f"ORD-{uuid4().hex[:10].upper()}",
        warehouse_id=payload.warehouse_id,
        created_by_user_id=current_user.id,
        status="draft",
    )
    db.add(order)
    db.flush()

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
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

    db.commit()
    db.refresh(order)
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    _user: User = Depends(require_roles("admin", "manager")),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order
