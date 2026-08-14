from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime
from typing import Optional


class ActionItemBase(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
    assignee: Optional[str] = None
    due_date: Optional[date] = None


class ActionItemCreate(ActionItemBase):
    pass


class ActionItemUpdate(BaseModel):
    text: Optional[str] = Field(None, min_length=1, max_length=1000)
    assignee: Optional[str] = None
    due_date: Optional[date] = None
    is_completed: Optional[bool] = None


class ActionItemResponse(ActionItemBase):
    id: int
    meeting_id: int
    is_completed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
