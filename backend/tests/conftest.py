from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password
from app.core.deps import get_db
from app.database.base import Base
from app.database.models import Organization, Role, User
from app.main import create_app
from app.services.bootstrap import seed_defaults


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    seed_defaults(db)

    default_org = Organization(name="Default", slug="default")
    db.add(default_org)
    db.flush()

    owner_role = db.query(Role).filter(Role.name == "owner").first()
    db.add(
        User(
            email="admin@example.com",
            full_name="Admin User",
            password_hash=hash_password("Admin@123456"),
            role_id=owner_role.id,
            org_id=default_org.id,
            is_active=True,
        )
    )
    db.commit()

    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    app = create_app()

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client
