from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OrgOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    created_at: datetime


class OrgUpdate(BaseModel):
    name: str | None = None
