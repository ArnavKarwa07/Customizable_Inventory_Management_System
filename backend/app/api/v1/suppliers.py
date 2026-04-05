from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_scope
from app.database.models import Supplier, User
from app.schemas.supplier import SupplierCreate, SupplierOut, SupplierUpdate
from app.services.audit_service import log_action

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("", response_model=list[SupplierOut])
def list_suppliers(user: User = Depends(require_scope("suppliers:read")), db: Session = Depends(get_db)):
    return db.query(Supplier).filter(Supplier.org_id == user.org_id).order_by(Supplier.id.desc()).all()


@router.post("", response_model=SupplierOut, status_code=status.HTTP_201_CREATED)
def create_supplier(
    payload: SupplierCreate,
    user: User = Depends(require_scope("suppliers:create")),
    db: Session = Depends(get_db),
):
    supplier = Supplier(
        org_id=user.org_id,
        name=payload.name,
        contact_email=payload.contact_email,
        phone=payload.phone,
        address=payload.address,
    )
    db.add(supplier)
    log_action(db, user, "create", "supplier", None, f"Created supplier: {payload.name}")
    db.commit()
    db.refresh(supplier)
    return supplier


@router.patch("/{supplier_id}", response_model=SupplierOut)
def update_supplier(
    supplier_id: int,
    payload: SupplierUpdate,
    user: User = Depends(require_scope("suppliers:update")),
    db: Session = Depends(get_db),
):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.org_id == user.org_id).first()
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

    for field in ["name", "contact_email", "phone", "address", "is_active"]:
        val = getattr(payload, field)
        if val is not None:
            setattr(supplier, field, val)

    log_action(db, user, "update", "supplier", supplier_id, f"Updated supplier: {supplier.name}")
    db.commit()
    db.refresh(supplier)
    return supplier


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(
    supplier_id: int,
    user: User = Depends(require_scope("suppliers:delete")),
    db: Session = Depends(get_db),
):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.org_id == user.org_id).first()
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    log_action(db, user, "delete", "supplier", supplier_id, f"Deleted supplier: {supplier.name}")
    db.delete(supplier)
    db.commit()
