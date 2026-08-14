from pydantic import BaseModel
from typing import Optional


class SearchResult(BaseModel):
    meeting_id: int
    meeting_title: str
    segment_id: Optional[int] = None
    content: str
    start_time: Optional[float] = None
    match_type: str


class SearchResponse(BaseModel):
    query: str
    total_results: int
    results: list[SearchResult]


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str
    meeting_id: int
