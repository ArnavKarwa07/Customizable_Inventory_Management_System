from sqlalchemy.orm import Session

from app.database.models import AuditLog, User


def log_action(
    db: Session,
    user: User,
    action: str,
    resource_type: str,
    resource_id: int | None = None,
    details: str | None = None,
) -> AuditLog:
    """Create an audit-log entry for the user's action."""
    entry = AuditLog(
        org_id=user.org_id,
        user_id=user.id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
    )
    db.add(entry)
    # Not committing here – caller is responsible for the final commit.
    return entry
