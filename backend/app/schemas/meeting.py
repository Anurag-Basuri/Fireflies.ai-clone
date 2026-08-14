from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime
from typing import Optional


class ParticipantBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[str] = None
    role: Optional[str] = None


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantResponse(ParticipantBase):
    id: int
    meeting_id: int

    model_config = ConfigDict(from_attributes=True)


class SpeakerResponse(BaseModel):
    id: int
    meeting_id: int
    label: str
    color_hex: str

    model_config = ConfigDict(from_attributes=True)


class TagResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class TagAttach(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class MeetingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    meeting_date: date
    duration_seconds: Optional[int] = None


class MeetingCreate(MeetingBase):
    participants: list[ParticipantCreate] = []
    transcript_text: Optional[str] = None


class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    meeting_date: Optional[date] = None
    participants: Optional[list[ParticipantCreate]] = None


class MeetingListItem(BaseModel):
    id: int
    title: str
    meeting_date: date
    duration_seconds: Optional[int] = None
    status: str
    media_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    participants: list[ParticipantResponse] = []
    tags: list[TagResponse] = []

    model_config = ConfigDict(from_attributes=True)


class MeetingDetail(MeetingListItem):
    owner_id: int
    media_url: Optional[str] = None
    speakers: list[SpeakerResponse] = []
    summary: Optional["SummaryResponse"] = None
    key_topics: list["KeyTopicResponse"] = []
    action_items: list["ActionItemResponse"] = []


class PaginatedMeetings(BaseModel):
    items: list[MeetingListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# Forward reference imports resolved at end of module
from app.schemas.summary import SummaryResponse, KeyTopicResponse
from app.schemas.action_item import ActionItemResponse

# Rebuild model to resolve forward references
MeetingDetail.model_rebuild()
