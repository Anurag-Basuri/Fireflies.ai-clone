from pydantic import BaseModel, ConfigDict
from typing import Optional


class TranscriptSegmentResponse(BaseModel):
    id: int
    meeting_id: int
    speaker_id: Optional[int] = None
    speaker_label: Optional[str] = None
    speaker_color: Optional[str] = None
    start_time: float
    end_time: float
    content: str
    sequence_index: int

    model_config = ConfigDict(from_attributes=True)


class TranscriptSearchMatch(BaseModel):
    segment: TranscriptSegmentResponse
    match_offsets: list[list[int]] = []


class TranscriptSearchResponse(BaseModel):
    query: str
    total_matches: int
    matches: list[TranscriptSearchMatch]
