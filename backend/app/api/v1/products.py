from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_roles
from app.database.models import Product, User
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=list[ProductOut])
def list_products(
    search: str | None = Query(default=None),
    _user: User = Depends(require_roles("admin", "manager", "staff")),
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if search:
        pattern = f"%{search}%"
        query = query.filter((Product.name.ilike(pattern)) | (Product.sku.ilike(pattern)))
    return query.order_by(Product.id.desc()).all()


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, _admin: User = Depends(require_roles("admin", "manager")), db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")

    product = Product(
        sku=payload.sku,
        name=payload.name,
        description=payload.description,
        unit_price=payload.unit_price,
        low_stock_threshold=payload.low_stock_threshold,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    _admin: User = Depends(require_roles("admin", "manager")),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    for field_name in ["name", "description", "unit_price", "low_stock_threshold", "is_active"]:
        field_value = getattr(payload, field_name)
        if field_value is not None:
            setattr(product, field_name, field_value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, _admin: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(product)
    db.commit()
