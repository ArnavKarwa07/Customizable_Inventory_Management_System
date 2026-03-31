from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_roles
from app.database.models import User, Warehouse
from app.schemas.warehouse import WarehouseCreate, WarehouseOut, WarehouseUpdate

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])


@router.get("", response_model=list[WarehouseOut])
def list_warehouses(_user: User = Depends(require_roles("admin", "manager", "staff")), db: Session = Depends(get_db)):
    return db.query(Warehouse).all()


@router.post("", response_model=WarehouseOut, status_code=status.HTTP_201_CREATED)
def create_warehouse(
    payload: WarehouseCreate,
    _admin: User = Depends(require_roles("admin", "manager")),
    db: Session = Depends(get_db),
):
    duplicate = db.query(Warehouse).filter((Warehouse.name == payload.name) | (Warehouse.code == payload.code)).first()
    if duplicate:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Warehouse with name or code already exists")

    warehouse = Warehouse(name=payload.name, code=payload.code, address=payload.address)
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse


@router.patch("/{warehouse_id}", response_model=WarehouseOut)
def update_warehouse(
    warehouse_id: int,
    payload: WarehouseUpdate,
    _admin: User = Depends(require_roles("admin", "manager")),
    db: Session = Depends(get_db),
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")

    if payload.name is not None:
        warehouse.name = payload.name
    if payload.address is not None:
        warehouse.address = payload.address
    if payload.is_active is not None:
        warehouse.is_active = payload.is_active

    db.commit()
    db.refresh(warehouse)
    return warehouse

