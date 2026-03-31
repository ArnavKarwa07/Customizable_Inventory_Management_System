from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.database.models import Role, User


def seed_defaults(db: Session) -> None:
    for role_name in ["admin", "manager", "staff"]:
        exists = db.query(Role).filter(Role.name == role_name).first()
        if not exists:
            db.add(Role(name=role_name, description=f"{role_name.title()} role"))
    db.commit()

    admin_role = db.query(Role).filter(Role.name == "admin").first()
    admin = db.query(User).filter(User.email == settings.default_admin_email).first()
    if not admin and admin_role:
        db.add(
            User(
                email=settings.default_admin_email,
                full_name="System Administrator",
                password_hash=hash_password(settings.default_admin_password),
                role_id=admin_role.id,
                is_active=True,
            )
        )
        db.commit()
