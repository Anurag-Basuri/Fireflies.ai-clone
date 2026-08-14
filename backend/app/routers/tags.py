from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.tag import Tag, MeetingTag
from app.models.meeting import Meeting
from app.schemas.meeting import TagResponse, TagAttach

router = APIRouter(tags=["tags"])


@router.get("/tags", response_model=list[TagResponse])
def list_tags(db: Session = Depends(get_db)):
    # List all tags in the system
    tags = db.query(Tag).order_by(Tag.name).all()
    return [TagResponse.model_validate(t) for t in tags]


@router.post(
    "/meetings/{meeting_id}/tags",
    response_model=TagResponse,
    status_code=201,
)
def attach_tag(
    meeting_id: int,
    data: TagAttach,
    db: Session = Depends(get_db),
):
    # Attach a tag to a meeting, creating the tag if it does not exist
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Find or create the tag
    tag = db.query(Tag).filter(Tag.name == data.name).first()
    if not tag:
        tag = Tag(name=data.name)
        db.add(tag)
        db.flush()

    # Check if already attached
    existing = (
        db.query(MeetingTag)
        .filter(MeetingTag.meeting_id == meeting_id, MeetingTag.tag_id == tag.id)
        .first()
    )
    if not existing:
        mt = MeetingTag(meeting_id=meeting_id, tag_id=tag.id)
        db.add(mt)

    db.commit()
    return TagResponse.model_validate(tag)


@router.delete("/meetings/{meeting_id}/tags/{tag_id}", status_code=204)
def detach_tag(
    meeting_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
):
    # Detach a tag from a meeting without deleting the tag itself
    mt = (
        db.query(MeetingTag)
        .filter(MeetingTag.meeting_id == meeting_id, MeetingTag.tag_id == tag_id)
        .first()
    )
    if not mt:
        raise HTTPException(status_code=404, detail="Tag not attached to this meeting")

    db.delete(mt)
    db.commit()
    return None
