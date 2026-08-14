from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
