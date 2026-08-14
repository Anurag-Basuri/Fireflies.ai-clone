from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.meeting import Meeting
from app.models.summary import Summary
from app.models.transcript_segment import TranscriptSegment
from app.schemas.search import AskRequest, AskResponse
from app.services.llm_service import ask_meeting_question

router = APIRouter(tags=["ask"])


@router.post("/meetings/{meeting_id}/ask", response_model=AskResponse)
def ask_about_meeting(
    meeting_id: int,
    data: AskRequest,
    db: Session = Depends(get_db),
):
    # Answer a question about a meeting using its transcript and summary as context
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Assemble context from transcript and summary
    segments = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.sequence_index)
        .all()
    )

    transcript_text = "\n".join(
        f"{seg.speaker.label if seg.speaker else 'Unknown'}: {seg.content}"
        for seg in segments
    )

    summary = db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
    summary_text = summary.overview if summary else "No summary available."

    answer = ask_meeting_question(data.question, transcript_text, summary_text)

    return AskResponse(answer=answer, meeting_id=meeting_id)
