from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_scope
from app.database.models import User
from app.schemas.organization import OrgOut, OrgUpdate
from app.services.audit_service import log_action

router = APIRouter(prefix="/org", tags=["Organization"])


@router.get("", response_model=OrgOut)
def get_org(user: User = Depends(require_scope("products:read")), db: Session = Depends(get_db)):
    return user.organization


@router.patch("", response_model=OrgOut)
def update_org(
    payload: OrgUpdate,
    user: User = Depends(require_scope("org:update")),
    db: Session = Depends(get_db),
):
    org = user.organization
    if payload.name is not None:
        org.name = payload.name
    log_action(db, user, "update", "organization", org.id, f"Updated org name to: {org.name}")
    db.commit()
    db.refresh(org)
    return org
