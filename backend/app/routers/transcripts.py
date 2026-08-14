import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.transcript_segment import TranscriptSegment
from app.models.meeting import Meeting
from app.schemas.transcript import (
    TranscriptSegmentResponse,
    TranscriptSearchMatch,
    TranscriptSearchResponse,
)

router = APIRouter(tags=["transcripts"])


@router.get(
    "/meetings/{meeting_id}/transcript",
    response_model=list[TranscriptSegmentResponse],
)
def get_transcript(meeting_id: int, db: Session = Depends(get_db)):
    # Retrieve all transcript segments for a meeting, ordered by sequence
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    segments = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.sequence_index)
        .all()
    )

    return [_segment_to_response(seg) for seg in segments]


@router.get(
    "/meetings/{meeting_id}/transcript/search",
    response_model=TranscriptSearchResponse,
)
def search_transcript(
    meeting_id: int,
    q: str = "",
    db: Session = Depends(get_db),
):
    # Search within a transcript, returning segments with match offsets for highlighting
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if not q.strip():
        return TranscriptSearchResponse(query=q, total_matches=0, matches=[])

    segments = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.sequence_index)
        .all()
    )

    matches = []
    query_lower = q.lower()

    for seg in segments:
        content_lower = seg.content.lower()
        offsets = []
        start = 0

        # Find all case-insensitive match positions
        while True:
            idx = content_lower.find(query_lower, start)
            if idx == -1:
                break
            offsets.append([idx, idx + len(q)])
            start = idx + 1

        if offsets:
            matches.append(TranscriptSearchMatch(
                segment=_segment_to_response(seg),
                match_offsets=offsets,
            ))

    return TranscriptSearchResponse(
        query=q,
        total_matches=sum(len(m.match_offsets) for m in matches),
        matches=matches,
    )


def _segment_to_response(seg: TranscriptSegment) -> TranscriptSegmentResponse:
    # Convert a TranscriptSegment ORM instance to its response schema
    return TranscriptSegmentResponse(
        id=seg.id,
        meeting_id=seg.meeting_id,
        speaker_id=seg.speaker_id,
        speaker_label=seg.speaker.label if seg.speaker else None,
        speaker_color=seg.speaker.color_hex if seg.speaker else None,
        start_time=seg.start_time,
        end_time=seg.end_time,
        content=seg.content,
        sequence_index=seg.sequence_index,
    )
