from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_roles
from app.core.security import hash_password
from app.database.models import Role, User
from app.schemas.user import UserCreate, UserOut, UserUpdate, UserWithRole

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserWithRole)
def get_me(current_user: User = Depends(get_current_user)):
    return UserWithRole(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        role_name=current_user.role.name,
    )


@router.get("", response_model=list[UserWithRole])
def list_users(_admin: User = Depends(require_roles("admin", "manager")), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        UserWithRole(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at,
            role_name=user.role.name,
        )
        for user in users
    ]


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, _admin: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

    role = db.query(Role).filter(Role.name == payload.role_name).first()
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        role_id=role.id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    _admin: User = Depends(require_roles("admin", "manager")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.role_name is not None:
        role = db.query(Role).filter(Role.name == payload.role_name).first()
        if role is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
        user.role_id = role.id

    db.commit()
    db.refresh(user)
    return user
