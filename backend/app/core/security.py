from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

import bcrypt as _bcrypt
import jwt

from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _bcrypt.checkpw(
        plain_password.encode("utf-8")[:72],
        hashed_password.encode("utf-8"),
    )


def hash_password(password: str) -> str:
    hashed = _bcrypt.hashpw(password.encode("utf-8")[:72], _bcrypt.gensalt())
    return hashed.decode("utf-8")


def _encode_token(payload: dict[str, Any]) -> str:
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    if isinstance(token, bytes):
        return token.decode("utf-8")
    return token


def create_access_token(subject: str, org_id: int | None = None) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(hours=settings.jwt_expiration_hours)
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": now,
        "type": "access",
        "jti": str(uuid4()),
    }
    if org_id is not None:
        payload["org_id"] = org_id
    return _encode_token(payload)


def create_refresh_token(subject: str, org_id: int | None = None) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.jwt_refresh_expiration_days)
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": now,
        "type": "refresh",
        "jti": str(uuid4()),
    }
    if org_id is not None:
        payload["org_id"] = org_id
    return _encode_token(payload)


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
