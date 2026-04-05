import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_scope
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.database.models import Organization, RefreshToken, Role, User
from app.schemas.auth import InviteUserRequest, LoginRequest, OrgCreateRequest, RefreshRequest, RegisterRequest
from app.schemas.token import TokenPair
from app.schemas.user import UserOut, UserWithRole
from app.services.audit_service import log_action

router = APIRouter(prefix="/auth", tags=["Authentication"])

SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9\-]{1,78}[a-z0-9]$")


def _validate_slug(slug: str) -> None:
    if not SLUG_RE.match(slug):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Slug must be 3-80 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphens",
        )


# ── Create organisation ──────────────────────────────────────

@router.post("/org/create", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def create_org(payload: OrgCreateRequest, db: Session = Depends(get_db)):
    _validate_slug(payload.org_slug)

    if db.query(Organization).filter(Organization.slug == payload.org_slug).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Organization slug already in use")

    if db.query(User).filter(User.email == payload.admin_email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    org = Organization(name=payload.org_name, slug=payload.org_slug)
    db.add(org)
    db.flush()

    owner_role = db.query(Role).filter(Role.name == "owner").first()
    if not owner_role:
        raise HTTPException(status_code=500, detail="Role bootstrap incomplete")

    user = User(
        email=payload.admin_email,
        full_name=payload.admin_full_name,
        password_hash=hash_password(payload.admin_password),
        role_id=owner_role.id,
        org_id=org.id,
        is_active=True,
    )
    db.add(user)
    db.flush()

    log_action(db, user, "create", "organization", org.id, f"Created org: {org.name}")
    db.commit()

    access_token = create_access_token(subject=str(user.id), org_id=org.id)
    refresh_token = create_refresh_token(subject=str(user.id), org_id=org.id)
    refresh_payload = decode_token(refresh_token)

    db.add(
        RefreshToken(
            user_id=user.id,
            token_jti=refresh_payload["jti"],
            expires_at=datetime.fromtimestamp(refresh_payload["exp"], tz=timezone.utc).replace(tzinfo=None),
        )
    )
    db.commit()
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


# ── Login ─────────────────────────────────────────────────────

@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.slug == payload.org_slug).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid organization or credentials")

    user = db.query(User).filter(User.email == payload.email, User.org_id == org.id).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid organization or credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account has been deactivated")

    access_token = create_access_token(subject=str(user.id), org_id=org.id)
    refresh_token = create_refresh_token(subject=str(user.id), org_id=org.id)
    refresh_payload = decode_token(refresh_token)

    db.add(
        RefreshToken(
            user_id=user.id,
            token_jti=refresh_payload["jti"],
            expires_at=datetime.fromtimestamp(refresh_payload["exp"], tz=timezone.utc).replace(tzinfo=None),
        )
    )
    db.commit()
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


# ── Register (self-registration as staff into existing org) ──

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.slug == payload.org_slug).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    if db.query(User).filter(User.email == payload.email, User.org_id == org.id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered in this organization")

    staff_role = db.query(Role).filter(Role.name == "staff").first()
    if not staff_role:
        raise HTTPException(status_code=500, detail="Role bootstrap incomplete")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        role_id=staff_role.id,
        org_id=org.id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ── Invite (owner/admin creates a user with chosen role) ─────

@router.post("/invite", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def invite_user(
    payload: InviteUserRequest,
    current_user: User = Depends(require_scope("users:create")),
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == payload.email, User.org_id == current_user.org_id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered in this organization")

    role = db.query(Role).filter(Role.name == payload.role_name).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    # Cannot assign a role higher than your own
    if role.level < current_user.role.level:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot assign a role higher than your own")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        role_id=role.id,
        org_id=current_user.org_id,
        is_active=True,
    )
    db.add(user)
    log_action(db, current_user, "invite", "user", None, f"Invited {payload.email} as {payload.role_name}")
    db.commit()
    db.refresh(user)
    return user


# ── Refresh ───────────────────────────────────────────────────

@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        token_payload = decode_token(payload.refresh_token)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

    if token_payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    stored_token = db.query(RefreshToken).filter(RefreshToken.token_jti == token_payload.get("jti")).first()
    if not stored_token or stored_token.revoked:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is revoked")

    stored_token.revoked = True

    user_id = int(token_payload["sub"])
    org_id = token_payload.get("org_id")
    access_token = create_access_token(subject=str(user_id), org_id=org_id)
    refresh_token = create_refresh_token(subject=str(user_id), org_id=org_id)
    new_refresh_payload = decode_token(refresh_token)
    db.add(
        RefreshToken(
            user_id=user_id,
            token_jti=new_refresh_payload["jti"],
            expires_at=datetime.fromtimestamp(new_refresh_payload["exp"], tz=timezone.utc).replace(tzinfo=None),
        )
    )
    db.commit()

    return TokenPair(access_token=access_token, refresh_token=refresh_token)


# ── Logout ────────────────────────────────────────────────────

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(payload: RefreshRequest, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    try:
        token_payload = decode_token(payload.refresh_token)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

    token_record = db.query(RefreshToken).filter(RefreshToken.token_jti == token_payload.get("jti")).first()
    if token_record:
        token_record.revoked = True
        db.commit()
