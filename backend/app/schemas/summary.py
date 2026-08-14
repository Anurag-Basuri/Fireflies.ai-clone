from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class SummaryResponse(BaseModel):
    id: int
    meeting_id: int
    overview: Optional[str] = None
    bullet_notes_json: Optional[str] = None
    generated_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class KeyTopicResponse(BaseModel):
    id: int
    meeting_id: int
    title: str
    start_time: Optional[float] = None
    order_index: int

    model_config = ConfigDict(from_attributes=True)
