from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_scope
from app.core.security import hash_password
from app.database.models import Role, User
from app.schemas.user import UserCreate, UserOut, UserUpdate, UserWithRole
from app.services.audit_service import log_action

router = APIRouter(prefix="/users", tags=["Users"])


def _user_to_out(user: User) -> UserWithRole:
    return UserWithRole(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at,
        role_name=user.role.name,
        org_id=user.org_id,
        org_name=user.organization.name,
    )


@router.get("/me", response_model=UserWithRole)
def get_me(current_user: User = Depends(get_current_user)):
    return _user_to_out(current_user)


@router.get("", response_model=list[UserWithRole])
def list_users(user: User = Depends(require_scope("users:read")), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.org_id == user.org_id).all()
    return [_user_to_out(u) for u in users]


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    user: User = Depends(require_scope("users:create")),
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == payload.email, User.org_id == user.org_id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

    role = db.query(Role).filter(Role.name == payload.role_name).first()
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    new_user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        role_id=role.id,
        org_id=user.org_id,
        is_active=True,
    )
    db.add(new_user)
    log_action(db, user, "create", "user", None, f"Created user: {payload.email}")
    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    user: User = Depends(require_scope("users:update")),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == user_id, User.org_id == user.org_id).first()
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.full_name is not None:
        target.full_name = payload.full_name
    if payload.is_active is not None:
        target.is_active = payload.is_active
    if payload.role_name is not None:
        role = db.query(Role).filter(Role.name == payload.role_name).first()
        if role is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
        # Cannot assign a role higher than your own
        if role.level < user.role.level:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot assign a role higher than your own")
        target.role_id = role.id

    log_action(db, user, "update", "user", user_id, f"Updated user: {target.email}")
    db.commit()
    db.refresh(target)
    return target


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    user: User = Depends(require_scope("users:delete")),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == user_id, User.org_id == user.org_id).first()
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if target.id == user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself")

    target.is_active = False
    log_action(db, user, "deactivate", "user", user_id, f"Deactivated user: {target.email}")
    db.commit()
