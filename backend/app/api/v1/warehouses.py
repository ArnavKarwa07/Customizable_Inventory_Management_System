from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_scope
from app.database.models import Inventory, User, Warehouse
from app.schemas.warehouse import WarehouseCreate, WarehouseOut, WarehouseUpdate
from app.services.audit_service import log_action

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])


@router.get("", response_model=list[WarehouseOut])
def list_warehouses(user: User = Depends(require_scope("warehouses:read")), db: Session = Depends(get_db)):
    return db.query(Warehouse).filter(Warehouse.org_id == user.org_id).all()


@router.get("/{warehouse_id}", response_model=WarehouseOut)
def get_warehouse(warehouse_id: int, user: User = Depends(require_scope("warehouses:read")), db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id, Warehouse.org_id == user.org_id).first()
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return warehouse


@router.post("", response_model=WarehouseOut, status_code=status.HTTP_201_CREATED)
def create_warehouse(
    payload: WarehouseCreate,
    user: User = Depends(require_scope("warehouses:create")),
    db: Session = Depends(get_db),
):
    duplicate = db.query(Warehouse).filter(
        Warehouse.org_id == user.org_id,
        (Warehouse.name == payload.name) | (Warehouse.code == payload.code),
    ).first()
    if duplicate:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Warehouse with name or code already exists")

    warehouse = Warehouse(org_id=user.org_id, name=payload.name, code=payload.code, address=payload.address)
    db.add(warehouse)
    log_action(db, user, "create", "warehouse", None, f"Created warehouse: {payload.name}")
    db.commit()
    db.refresh(warehouse)
    return warehouse


@router.patch("/{warehouse_id}", response_model=WarehouseOut)
def update_warehouse(
    warehouse_id: int,
    payload: WarehouseUpdate,
    user: User = Depends(require_scope("warehouses:update")),
    db: Session = Depends(get_db),
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id, Warehouse.org_id == user.org_id).first()
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")

    if payload.name is not None:
        warehouse.name = payload.name
    if payload.address is not None:
        warehouse.address = payload.address
    if payload.is_active is not None:
        warehouse.is_active = payload.is_active

    log_action(db, user, "update", "warehouse", warehouse_id, f"Updated warehouse: {warehouse.name}")
    db.commit()
    db.refresh(warehouse)
    return warehouse


@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_warehouse(
    warehouse_id: int,
    user: User = Depends(require_scope("warehouses:delete")),
    db: Session = Depends(get_db),
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id, Warehouse.org_id == user.org_id).first()
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")

    has_stock = db.query(Inventory).filter(Inventory.warehouse_id == warehouse_id, Inventory.quantity > 0).first()
    if has_stock:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete warehouse with active inventory")

    log_action(db, user, "delete", "warehouse", warehouse_id, f"Deleted warehouse: {warehouse.name}")
    db.delete(warehouse)
    db.commit()
