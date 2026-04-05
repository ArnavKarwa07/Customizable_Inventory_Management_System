from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_scope
from app.database.models import Product, User
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.services.audit_service import log_action

router = APIRouter(prefix="/products", tags=["Products"])


def _product_to_out(product: Product) -> ProductOut:
    return ProductOut(
        id=product.id,
        sku=product.sku,
        name=product.name,
        description=product.description,
        unit_price=product.unit_price,
        low_stock_threshold=product.low_stock_threshold,
        is_active=product.is_active,
        category_id=product.category_id,
        supplier_id=product.supplier_id,
        category_name=product.category.name if product.category else None,
        supplier_name=product.supplier.name if product.supplier else None,
        created_at=product.created_at,
    )


@router.get("", response_model=list[ProductOut])
def list_products(
    search: str | None = Query(default=None),
    user: User = Depends(require_scope("products:read")),
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.org_id == user.org_id)
    if search:
        pattern = f"%{search}%"
        query = query.filter((Product.name.ilike(pattern)) | (Product.sku.ilike(pattern)))
    products = query.order_by(Product.id.desc()).all()
    return [_product_to_out(p) for p in products]


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    user: User = Depends(require_scope("products:read")),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id, Product.org_id == user.org_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return _product_to_out(product)


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    user: User = Depends(require_scope("products:create")),
    db: Session = Depends(get_db),
):
    existing = db.query(Product).filter(Product.sku == payload.sku, Product.org_id == user.org_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")

    product = Product(
        org_id=user.org_id,
        sku=payload.sku,
        name=payload.name,
        description=payload.description,
        unit_price=payload.unit_price,
        low_stock_threshold=payload.low_stock_threshold,
        category_id=payload.category_id,
        supplier_id=payload.supplier_id,
    )
    db.add(product)
    log_action(db, user, "create", "product", None, f"Created product: {payload.sku}")
    db.commit()
    db.refresh(product)
    return _product_to_out(product)


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    user: User = Depends(require_scope("products:update")),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id, Product.org_id == user.org_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    for field_name in ["name", "description", "unit_price", "low_stock_threshold", "is_active", "category_id", "supplier_id"]:
        field_value = getattr(payload, field_name)
        if field_value is not None:
            setattr(product, field_name, field_value)

    log_action(db, user, "update", "product", product_id, f"Updated product: {product.sku}")
    db.commit()
    db.refresh(product)
    return _product_to_out(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    user: User = Depends(require_scope("products:delete")),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id, Product.org_id == user.org_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    log_action(db, user, "delete", "product", product_id, f"Deleted product: {product.sku}")
    db.delete(product)
    db.commit()
