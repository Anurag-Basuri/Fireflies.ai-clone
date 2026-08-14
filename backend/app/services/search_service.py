from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.meeting import Meeting
from app.models.transcript_segment import TranscriptSegment
from app.schemas.search import SearchResult


def global_search(db: Session, query: str, limit: int = 50) -> list[SearchResult]:
    # Search across meeting titles and transcript content, returning grouped results
    results = []
    search_term = f"%{query}%"

    # Search meeting titles
    title_matches = (
        db.query(Meeting)
        .filter(Meeting.title.ilike(search_term))
        .limit(limit)
        .all()
    )

    for meeting in title_matches:
        results.append(SearchResult(
            meeting_id=meeting.id,
            meeting_title=meeting.title,
            segment_id=None,
            content=meeting.title,
            start_time=None,
            match_type="title",
        ))

    # Search transcript segment content
    remaining = limit - len(results)
    if remaining > 0:
        segment_matches = (
            db.query(TranscriptSegment)
            .join(Meeting, TranscriptSegment.meeting_id == Meeting.id)
            .filter(TranscriptSegment.content.ilike(search_term))
            .limit(remaining)
            .all()
        )

        for segment in segment_matches:
            results.append(SearchResult(
                meeting_id=segment.meeting_id,
                meeting_title=segment.meeting.title,
                segment_id=segment.id,
                content=segment.content,
                start_time=segment.start_time,
                match_type="transcript",
            ))

    return results
