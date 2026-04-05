from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_scope
from app.database.models import Inventory, Product, StockMovement, User, Warehouse
from app.schemas.inventory import InventoryOut, LowStockItem, StockAdjustRequest, StockMovementOut, StockTransferRequest
from app.services.audit_service import log_action

router = APIRouter(prefix="/inventory", tags=["Inventory"])


def utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _get_or_create_inventory(db: Session, product_id: int, warehouse_id: int) -> Inventory:
    item = db.query(Inventory).filter(Inventory.product_id == product_id, Inventory.warehouse_id == warehouse_id).first()
    if item is None:
        item = Inventory(product_id=product_id, warehouse_id=warehouse_id, quantity=0, updated_at=utcnow_naive())
        db.add(item)
        db.flush()
    return item


@router.get("", response_model=list[InventoryOut])
def list_inventory(user: User = Depends(require_scope("inventory:read")), db: Session = Depends(get_db)):
    rows = (
        db.query(Inventory)
        .join(Product, Product.id == Inventory.product_id)
        .filter(Product.org_id == user.org_id)
        .all()
    )
    return rows


@router.post("/adjust", response_model=InventoryOut)
def adjust_stock(
    payload: StockAdjustRequest,
    user: User = Depends(require_scope("inventory:adjust")),
    db: Session = Depends(get_db),
):
    # Verify product belongs to org
    product = db.query(Product).filter(Product.id == payload.product_id, Product.org_id == user.org_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    item = _get_or_create_inventory(db, payload.product_id, payload.warehouse_id)
    next_qty = item.quantity + payload.change
    if next_qty < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Adjustment would make stock negative")

    item.quantity = next_qty
    item.updated_at = utcnow_naive()

    db.add(
        StockMovement(
            product_id=payload.product_id,
            warehouse_id=payload.warehouse_id,
            change=payload.change,
            reason=payload.reason,
            created_by_user_id=user.id,
        )
    )
    log_action(db, user, "adjust", "inventory", item.id, f"Adjusted {product.sku} by {payload.change}")
    db.commit()
    db.refresh(item)
    return item


@router.post("/transfer", status_code=status.HTTP_200_OK)
def transfer_stock(
    payload: StockTransferRequest,
    user: User = Depends(require_scope("inventory:transfer")),
    db: Session = Depends(get_db),
):
    if payload.quantity <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be greater than zero")

    # Verify product belongs to org
    product = db.query(Product).filter(Product.id == payload.product_id, Product.org_id == user.org_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    source = _get_or_create_inventory(db, payload.product_id, payload.from_warehouse_id)
    target = _get_or_create_inventory(db, payload.product_id, payload.to_warehouse_id)

    if source.quantity < payload.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock in source warehouse")

    source.quantity -= payload.quantity
    target.quantity += payload.quantity
    source.updated_at = utcnow_naive()
    target.updated_at = utcnow_naive()

    db.add(
        StockMovement(
            product_id=payload.product_id,
            warehouse_id=payload.from_warehouse_id,
            change=-payload.quantity,
            reason=f"Transfer to warehouse {payload.to_warehouse_id}",
            created_by_user_id=user.id,
        )
    )
    db.add(
        StockMovement(
            product_id=payload.product_id,
            warehouse_id=payload.to_warehouse_id,
            change=payload.quantity,
            reason=f"Transfer from warehouse {payload.from_warehouse_id}",
            created_by_user_id=user.id,
        )
    )
    log_action(db, user, "transfer", "inventory", None, f"Transferred {payload.quantity} of {product.sku}")
    db.commit()

    return {
        "message": "Transfer completed",
        "from_warehouse_id": payload.from_warehouse_id,
        "to_warehouse_id": payload.to_warehouse_id,
        "quantity": payload.quantity,
    }


@router.get("/low-stock", response_model=list[LowStockItem])
def low_stock(user: User = Depends(require_scope("inventory:read")), db: Session = Depends(get_db)):
    rows = (
        db.query(Inventory, Product)
        .join(Product, Product.id == Inventory.product_id)
        .filter(Product.org_id == user.org_id)
        .filter(Inventory.quantity <= Product.low_stock_threshold)
        .all()
    )
    return [
        LowStockItem(
            product_id=product.id,
            sku=product.sku,
            product_name=product.name,
            warehouse_id=inventory.warehouse_id,
            quantity=inventory.quantity,
            threshold=product.low_stock_threshold,
        )
        for inventory, product in rows
    ]


@router.get("/movements", response_model=list[StockMovementOut])
def list_movements(
    limit: int = Query(default=50, le=200),
    user: User = Depends(require_scope("inventory:read")),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(StockMovement)
        .join(Product, Product.id == StockMovement.product_id)
        .filter(Product.org_id == user.org_id)
        .order_by(StockMovement.id.desc())
        .limit(limit)
        .all()
    )
    return rows
