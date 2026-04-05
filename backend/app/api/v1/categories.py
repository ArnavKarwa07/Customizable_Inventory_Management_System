from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_scope
from app.database.models import Category, User
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.services.audit_service import log_action

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(user: User = Depends(require_scope("categories:read")), db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.org_id == user.org_id).order_by(Category.name).all()


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    user: User = Depends(require_scope("categories:create")),
    db: Session = Depends(get_db),
):
    dup = db.query(Category).filter(Category.org_id == user.org_id, Category.name == payload.name).first()
    if dup:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name already exists")

    category = Category(org_id=user.org_id, name=payload.name, description=payload.description)
    db.add(category)
    log_action(db, user, "create", "category", None, f"Created category: {payload.name}")
    db.commit()
    db.refresh(category)
    return category


@router.patch("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    user: User = Depends(require_scope("categories:update")),
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == category_id, Category.org_id == user.org_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    if payload.name is not None:
        category.name = payload.name
    if payload.description is not None:
        category.description = payload.description

    log_action(db, user, "update", "category", category_id, f"Updated category: {category.name}")
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    user: User = Depends(require_scope("categories:delete")),
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == category_id, Category.org_id == user.org_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    log_action(db, user, "delete", "category", category_id, f"Deleted category: {category.name}")
    db.delete(category)
    db.commit()
