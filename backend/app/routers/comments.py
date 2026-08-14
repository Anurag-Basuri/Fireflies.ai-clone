from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.meeting import Meeting
from app.models.comment import Comment
from app.models.soundbite import Soundbite
from app.schemas.comment import (
    CommentCreate,
    CommentResponse,
    SoundbiteCreate,
    SoundbiteResponse,
)

router = APIRouter(tags=["comments_soundbites"])


@router.get(
    "/meetings/{meeting_id}/comments",
    response_model=list[CommentResponse],
)
def list_comments(meeting_id: int, db: Session = Depends(get_db)):
    # List all comments for a meeting
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    comments = (
        db.query(Comment)
        .filter(Comment.meeting_id == meeting_id)
        .order_by(Comment.created_at)
        .all()
    )
    return [CommentResponse.model_validate(c) for c in comments]


@router.post(
    "/meetings/{meeting_id}/comments",
    response_model=CommentResponse,
    status_code=201,
)
def create_comment(
    meeting_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
):
    # Add a comment to a meeting, optionally anchored to a transcript segment
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    comment = Comment(
        meeting_id=meeting_id,
        segment_id=data.segment_id,
        user_id=1,
        content=data.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CommentResponse.model_validate(comment)


@router.get(
    "/meetings/{meeting_id}/soundbites",
    response_model=list[SoundbiteResponse],
)
def list_soundbites(meeting_id: int, db: Session = Depends(get_db)):
    # List all soundbites for a meeting
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    soundbites = (
        db.query(Soundbite)
        .filter(Soundbite.meeting_id == meeting_id)
        .order_by(Soundbite.start_time)
        .all()
    )
    return [SoundbiteResponse.model_validate(s) for s in soundbites]


@router.post(
    "/meetings/{meeting_id}/soundbites",
    response_model=SoundbiteResponse,
    status_code=201,
)
def create_soundbite(
    meeting_id: int,
    data: SoundbiteCreate,
    db: Session = Depends(get_db),
):
    # Create a soundbite clip from a meeting
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    soundbite = Soundbite(
        meeting_id=meeting_id,
        segment_id=data.segment_id,
        title=data.title,
        start_time=data.start_time,
        end_time=data.end_time,
    )
    db.add(soundbite)
    db.commit()
    db.refresh(soundbite)

    return SoundbiteResponse.model_validate(soundbite)
