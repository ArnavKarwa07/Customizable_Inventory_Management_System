from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    org_slug: str
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """Self-register into an existing org (staff role)."""
    org_slug: str
    email: EmailStr
    full_name: str
    password: str


class OrgCreateRequest(BaseModel):
    """Create a new organization + owner account in one step."""
    org_name: str
    org_slug: str
    admin_email: EmailStr
    admin_full_name: str
    admin_password: str


class InviteUserRequest(BaseModel):
    """Owner / admin invites a user to the org."""
    email: EmailStr
    full_name: str
    password: str
    role_name: str = "staff"


class RefreshRequest(BaseModel):
    refresh_token: str
