from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role_name: str = "staff"


class UserUpdate(BaseModel):
    full_name: str | None = None
    is_active: bool | None = None
    role_name: str | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    created_at: datetime


class UserWithRole(UserOut):
    role_name: str
