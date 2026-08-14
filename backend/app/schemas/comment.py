from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)
    segment_id: Optional[int] = None


class CommentResponse(BaseModel):
    id: int
    meeting_id: int
    segment_id: Optional[int] = None
    user_id: int
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SoundbiteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    segment_id: Optional[int] = None
    start_time: float
    end_time: float


class SoundbiteResponse(BaseModel):
    id: int
    meeting_id: int
    segment_id: Optional[int] = None
    title: str
    start_time: float
    end_time: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
