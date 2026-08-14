import json
import math
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc

from app.core.db import get_db
from app.core.config import settings
from app.core.logging import logger
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.speaker import Speaker
from app.models.transcript_segment import TranscriptSegment
from app.models.summary import Summary
from app.models.key_topic import KeyTopic
from app.models.action_item import ActionItem
from app.models.tag import Tag, MeetingTag
from app.schemas.meeting import (
    MeetingCreate,
    MeetingUpdate,
    MeetingListItem,
    MeetingDetail,
    PaginatedMeetings,
    TagResponse,
    ParticipantResponse,
)
from app.services.transcript_parser import parse_transcript
from app.services.llm_service import generate_summary_with_llm, generate_fallback_summary

router = APIRouter(prefix="/meetings", tags=["meetings"])

# Predefined speaker colors for visual distinction in the transcript
SPEAKER_COLORS = [
    "#6366F1", "#EC4899", "#F59E0B", "#10B981",
    "#3B82F6", "#8B5CF6", "#EF4444", "#14B8A6",
]


@router.get("", response_model=PaginatedMeetings)
def list_meetings(
    q: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    participant: Optional[str] = None,
    tag: Optional[str] = None,
    sort: str = "recent",
    page: int = 1,
    page_size: int = 12,
    db: Session = Depends(get_db),
):
    # List meetings with server-side filtering, sorting, and pagination
    query = db.query(Meeting).options(
        joinedload(Meeting.participants),
        joinedload(Meeting.meeting_tags).joinedload(MeetingTag.tag),
    )

    if q:
        query = query.filter(Meeting.title.ilike(f"%{q}%"))

    if date_from:
        query = query.filter(Meeting.meeting_date >= date_from)

    if date_to:
        query = query.filter(Meeting.meeting_date <= date_to)

    if participant:
        query = query.join(Participant).filter(
            Participant.name.ilike(f"%{participant}%")
        )

    if tag:
        query = query.join(MeetingTag).join(Tag).filter(
            Tag.name.ilike(f"%{tag}%")
        )

    # Get total count before pagination
    total = query.distinct().count()

    # Apply sorting
    if sort == "title":
        query = query.order_by(asc(Meeting.title))
    else:
        query = query.order_by(desc(Meeting.created_at))

    # Apply pagination
    offset = (page - 1) * page_size
    meetings = query.offset(offset).limit(page_size).all()

    # Build response items with nested tags
    items = []
    for m in meetings:
        tags = [TagResponse(id=mt.tag.id, name=mt.tag.name) for mt in m.meeting_tags]
        participants = [
            ParticipantResponse(
                id=p.id,
                meeting_id=p.meeting_id,
                name=p.name,
                email=p.email,
                role=p.role,
            )
            for p in m.participants
        ]
        items.append(MeetingListItem(
            id=m.id,
            title=m.title,
            meeting_date=m.meeting_date,
            duration_seconds=m.duration_seconds,
            status=m.status,
            media_type=m.media_type,
            created_at=m.created_at,
            updated_at=m.updated_at,
            participants=participants,
            tags=tags,
        ))

    return PaginatedMeetings(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.post("", response_model=MeetingDetail, status_code=201)
def create_meeting(
    data: MeetingCreate,
    db: Session = Depends(get_db),
):
    # Create a meeting from form data with optional pasted transcript text
    meeting = Meeting(
        owner_id=1,
        title=data.title,
        meeting_date=data.meeting_date,
        duration_seconds=data.duration_seconds,
        media_url="/media/sample-meeting.mp3",
        media_type="placeholder",
        status="processing",
    )
    db.add(meeting)
    db.flush()

    # Add participants
    for p in data.participants:
        participant = Participant(
            meeting_id=meeting.id,
            name=p.name,
            email=p.email,
            role=p.role,
        )
        db.add(participant)

    # Parse and store transcript if provided
    if data.transcript_text:
        _process_transcript(db, meeting, data.transcript_text)
    else:
        meeting.status = "ready"

    db.commit()
    db.refresh(meeting)

    return _build_meeting_detail(db, meeting)


@router.post("/upload", response_model=MeetingDetail, status_code=201)
def create_meeting_upload(
    title: str = Form(...),
    meeting_date: str = Form(...),
    participants_json: str = Form("[]"),
    transcript_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Create a meeting from multipart file upload
    # Validate file type
    allowed_extensions = {"txt", "vtt", "json", "mp3", "mp4", "wav", "m4a"}
    filename = transcript_file.filename or "upload.txt"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: .{ext}",
        )

    # Read content
    content = transcript_file.file.read()
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.max_upload_mb}MB",
        )

    meeting = Meeting(
        owner_id=1,
        title=title,
        meeting_date=date.fromisoformat(meeting_date),
        media_url="/media/sample-meeting.mp3",
        media_type="placeholder",
        status="processing",
    )
    db.add(meeting)
    db.flush()

    # Parse participants
    try:
        participants_list = json.loads(participants_json)
        for p in participants_list:
            participant = Participant(
                meeting_id=meeting.id,
                name=p.get("name", "Unknown"),
                email=p.get("email"),
                role=p.get("role"),
            )
            db.add(participant)
    except (json.JSONDecodeError, TypeError):
        pass

    # Process transcript content
    text_content = content.decode("utf-8", errors="replace")
    _process_transcript(db, meeting, text_content, filename)

    db.commit()
    db.refresh(meeting)

    return _build_meeting_detail(db, meeting)


@router.get("/{meeting_id}", response_model=MeetingDetail)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    # Get full meeting detail with all related data
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    return _build_meeting_detail(db, meeting)


@router.patch("/{meeting_id}", response_model=MeetingDetail)
def update_meeting(
    meeting_id: int,
    data: MeetingUpdate,
    db: Session = Depends(get_db),
):
    # Update meeting metadata and optionally replace participants
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if data.title is not None:
        meeting.title = data.title
    if data.meeting_date is not None:
        meeting.meeting_date = data.meeting_date

    # Replace participants list entirely if provided
    if data.participants is not None:
        db.query(Participant).filter(
            Participant.meeting_id == meeting_id
        ).delete()
        for p in data.participants:
            participant = Participant(
                meeting_id=meeting_id,
                name=p.name,
                email=p.email,
                role=p.role,
            )
            db.add(participant)

    db.commit()
    db.refresh(meeting)

    return _build_meeting_detail(db, meeting)


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    # Delete meeting with cascading removal of all related data
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    db.delete(meeting)
    db.commit()
    return None


def _process_transcript(
    db: Session,
    meeting: Meeting,
    text: str,
    filename: Optional[str] = None,
):
    # Parse transcript text into segments, create speakers, and generate AI summary
    segments = parse_transcript(text, filename)

    if not segments:
        meeting.status = "ready"
        return

    # Collect unique speakers and assign colors
    speaker_labels = list(dict.fromkeys(s["speaker"] for s in segments))
    speaker_map = {}
    for idx, label in enumerate(speaker_labels):
        speaker = Speaker(
            meeting_id=meeting.id,
            label=label,
            color_hex=SPEAKER_COLORS[idx % len(SPEAKER_COLORS)],
        )
        db.add(speaker)
        db.flush()
        speaker_map[label] = speaker.id

    # Insert transcript segments
    for seg in segments:
        db_segment = TranscriptSegment(
            meeting_id=meeting.id,
            speaker_id=speaker_map.get(seg["speaker"]),
            start_time=seg["start_time"],
            end_time=seg["end_time"],
            content=seg["content"],
            sequence_index=seg["sequence_index"],
        )
        db.add(db_segment)

    # Calculate meeting duration from the last segment
    if segments:
        last_end = max(s["end_time"] for s in segments)
        meeting.duration_seconds = int(last_end)

    # Generate AI summary
    full_text = "\n".join(
        f"{s['speaker']}: {s['content']}" for s in segments
    )
    llm_result = generate_summary_with_llm(full_text)

    if llm_result:
        _store_summary(db, meeting.id, llm_result, "llm")
    else:
        fallback = generate_fallback_summary(full_text)
        _store_summary(db, meeting.id, fallback, "fallback")

    meeting.status = "ready"


def _store_summary(db: Session, meeting_id: int, data: dict, generated_by: str):
    # Persist summary, action items, and key topics to the database
    summary = Summary(
        meeting_id=meeting_id,
        overview=data.get("overview", ""),
        bullet_notes_json=json.dumps(data.get("bullet_notes", [])),
        generated_by=generated_by,
    )
    db.add(summary)

    # Store action items
    for item in data.get("action_items", []):
        action = ActionItem(
            meeting_id=meeting_id,
            text=item.get("text", ""),
            assignee=item.get("assignee"),
            due_date=None,
            is_completed=False,
        )
        db.add(action)

    # Store key topics
    for idx, topic in enumerate(data.get("key_topics", [])):
        kt = KeyTopic(
            meeting_id=meeting_id,
            title=topic.get("title", ""),
            start_time=topic.get("start_time"),
            order_index=idx,
        )
        db.add(kt)


def _build_meeting_detail(db: Session, meeting: Meeting) -> MeetingDetail:
    # Assemble complete meeting detail response with all nested relationships
    from app.schemas.summary import SummaryResponse, KeyTopicResponse
    from app.schemas.action_item import ActionItemResponse

    # Reload with relationships
    db.refresh(meeting)

    participants = [
        ParticipantResponse(
            id=p.id, meeting_id=p.meeting_id,
            name=p.name, email=p.email, role=p.role,
        )
        for p in meeting.participants
    ]

    tags = []
    for mt in meeting.meeting_tags:
        tags.append(TagResponse(id=mt.tag.id, name=mt.tag.name))

    from app.schemas.meeting import SpeakerResponse
    speakers = [
        SpeakerResponse(
            id=s.id, meeting_id=s.meeting_id,
            label=s.label, color_hex=s.color_hex,
        )
        for s in meeting.speakers
    ]

    summary_resp = None
    if meeting.summary:
        summary_resp = SummaryResponse.model_validate(meeting.summary)

    topics = [
        KeyTopicResponse.model_validate(kt)
        for kt in sorted(meeting.key_topics, key=lambda x: x.order_index)
    ]

    actions = [
        ActionItemResponse.model_validate(ai)
        for ai in meeting.action_items
    ]

    return MeetingDetail(
        id=meeting.id,
        owner_id=meeting.owner_id,
        title=meeting.title,
        meeting_date=meeting.meeting_date,
        duration_seconds=meeting.duration_seconds,
        status=meeting.status,
        media_url=meeting.media_url,
        media_type=meeting.media_type,
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
        participants=participants,
        tags=tags,
        speakers=speakers,
        summary=summary_resp,
        key_topics=topics,
        action_items=actions,
    )
