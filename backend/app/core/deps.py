from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_token
from app.database.models import User
from app.database.session import SessionLocal

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise credentials_exception
        user_id = int(payload.get("sub"))
    except Exception as exc:  # noqa: BLE001
        raise credentials_exception from exc

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


# ── Role hierarchy: owner(0) < admin(1) < manager(2) < staff(3) ──

ROLE_PERMISSIONS: dict[str, set[str]] = {
    "owner": {
        "org:update", "org:delete",
        "users:create", "users:read", "users:update", "users:delete",
        "products:create", "products:read", "products:update", "products:delete",
        "orders:create", "orders:read", "orders:update", "orders:delete",
        "warehouses:create", "warehouses:read", "warehouses:update", "warehouses:delete",
        "inventory:read", "inventory:adjust", "inventory:transfer",
        "suppliers:create", "suppliers:read", "suppliers:update", "suppliers:delete",
        "categories:create", "categories:read", "categories:update", "categories:delete",
        "audit:read",
    },
    "admin": {
        "users:create", "users:read", "users:update",
        "products:create", "products:read", "products:update", "products:delete",
        "orders:create", "orders:read", "orders:update", "orders:delete",
        "warehouses:create", "warehouses:read", "warehouses:update", "warehouses:delete",
        "inventory:read", "inventory:adjust", "inventory:transfer",
        "suppliers:create", "suppliers:read", "suppliers:update", "suppliers:delete",
        "categories:create", "categories:read", "categories:update", "categories:delete",
        "audit:read",
    },
    "manager": {
        "products:create", "products:read", "products:update",
        "orders:create", "orders:read", "orders:update",
        "warehouses:create", "warehouses:read", "warehouses:update",
        "inventory:read", "inventory:adjust", "inventory:transfer",
        "suppliers:create", "suppliers:read", "suppliers:update",
        "categories:create", "categories:read", "categories:update",
    },
    "staff": {
        "products:read",
        "orders:create", "orders:read",
        "warehouses:read",
        "inventory:read", "inventory:adjust",
        "suppliers:read",
        "categories:read",
    },
}


def require_roles(*allowed: str):
    """Legacy role-check dependency — checks role by name."""
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.name not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user

    return checker


def require_scope(*scopes: str):
    """Fine-grained scope-based permission check."""
    def checker(current_user: User = Depends(get_current_user)) -> User:
        role_name = current_user.role.name
        user_scopes = ROLE_PERMISSIONS.get(role_name, set())
        for scope in scopes:
            if scope not in user_scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing permission: {scope}",
                )
        return current_user

    return checker
