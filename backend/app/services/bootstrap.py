from sqlalchemy.orm import Session

from app.database.models import Role


SEED_ROLES = [
    {"name": "owner", "description": "Organization owner – full control", "level": 0},
    {"name": "admin", "description": "Administrator – manage users and data", "level": 1},
    {"name": "manager", "description": "Manager – manage products, orders, stock", "level": 2},
    {"name": "staff", "description": "Staff – view data, create orders, adjust stock", "level": 3},
]


def seed_defaults(db: Session) -> None:
    """Ensure the four built-in roles exist."""
    for role_def in SEED_ROLES:
        exists = db.query(Role).filter(Role.name == role_def["name"]).first()
        if not exists:
            db.add(Role(name=role_def["name"], description=role_def["description"], level=role_def["level"]))
    db.commit()
