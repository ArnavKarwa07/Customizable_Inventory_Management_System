from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_scope
from app.database.models import AuditLog, User
from app.schemas.audit import AuditLogOut

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("", response_model=list[AuditLogOut])
def list_audit_logs(
    limit: int = Query(default=50, le=200),
    resource_type: str | None = Query(default=None),
    user: User = Depends(require_scope("audit:read")),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog).filter(AuditLog.org_id == user.org_id)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    return query.order_by(AuditLog.id.desc()).limit(limit).all()
