import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.meeting import Meeting
from app.models.summary import Summary
from app.models.key_topic import KeyTopic
from app.models.action_item import ActionItem
from app.models.transcript_segment import TranscriptSegment
from app.schemas.summary import SummaryResponse, KeyTopicResponse
from app.services.llm_service import generate_summary_with_llm, generate_fallback_summary
from app.core.logging import logger

router = APIRouter(tags=["summaries"])


@router.get("/meetings/{meeting_id}/summary", response_model=SummaryResponse)
def get_summary(meeting_id: int, db: Session = Depends(get_db)):
    # Retrieve the AI-generated summary for a meeting
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    summary = db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="No summary available for this meeting")

    return SummaryResponse.model_validate(summary)


@router.post("/meetings/{meeting_id}/summary/regenerate", response_model=SummaryResponse)
def regenerate_summary(meeting_id: int, db: Session = Depends(get_db)):
    # Re-run LLM summary generation, replacing existing summary, action items, and key topics
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Get transcript text
    segments = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.sequence_index)
        .all()
    )

    if not segments:
        raise HTTPException(
            status_code=400,
            detail="No transcript segments found for regeneration",
        )

    full_text = "\n".join(
        f"{seg.speaker.label if seg.speaker else 'Unknown'}: {seg.content}"
        for seg in segments
    )

    # Delete existing summary, topics, and action items
    db.query(Summary).filter(Summary.meeting_id == meeting_id).delete()
    db.query(KeyTopic).filter(KeyTopic.meeting_id == meeting_id).delete()
    db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).delete()

    # Generate new summary
    llm_result = generate_summary_with_llm(full_text)

    if llm_result:
        generated_by = "llm"
        result = llm_result
    else:
        generated_by = "fallback"
        result = generate_fallback_summary(full_text)

    # Store new summary
    summary = Summary(
        meeting_id=meeting_id,
        overview=result.get("overview", ""),
        bullet_notes_json=json.dumps(result.get("bullet_notes", [])),
        generated_by=generated_by,
    )
    db.add(summary)

    # Store new action items
    for item in result.get("action_items", []):
        action = ActionItem(
            meeting_id=meeting_id,
            text=item.get("text", ""),
            assignee=item.get("assignee"),
            is_completed=False,
        )
        db.add(action)

    # Store new key topics
    for idx, topic in enumerate(result.get("key_topics", [])):
        kt = KeyTopic(
            meeting_id=meeting_id,
            title=topic.get("title", ""),
            start_time=topic.get("start_time"),
            order_index=idx,
        )
        db.add(kt)

    db.commit()
    db.refresh(summary)

    logger.info(f"Regenerated summary for meeting {meeting_id} via {generated_by}")
    return SummaryResponse.model_validate(summary)
