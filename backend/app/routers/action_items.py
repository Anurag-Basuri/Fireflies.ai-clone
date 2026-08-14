from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.action_item import ActionItem
from app.models.meeting import Meeting
from app.schemas.action_item import (
    ActionItemCreate,
    ActionItemUpdate,
    ActionItemResponse,
)

router = APIRouter(tags=["action_items"])


@router.get(
    "/meetings/{meeting_id}/action-items",
    response_model=list[ActionItemResponse],
)
def list_action_items(meeting_id: int, db: Session = Depends(get_db)):
    # List all action items for a specific meeting
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    items = (
        db.query(ActionItem)
        .filter(ActionItem.meeting_id == meeting_id)
        .order_by(ActionItem.created_at)
        .all()
    )
    return [ActionItemResponse.model_validate(item) for item in items]


@router.post(
    "/meetings/{meeting_id}/action-items",
    response_model=ActionItemResponse,
    status_code=201,
)
def create_action_item(
    meeting_id: int,
    data: ActionItemCreate,
    db: Session = Depends(get_db),
):
    # Manually create a new action item for a meeting
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    item = ActionItem(
        meeting_id=meeting_id,
        text=data.text,
        assignee=data.assignee,
        due_date=data.due_date,
        is_completed=False,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return ActionItemResponse.model_validate(item)


@router.patch("/action-items/{item_id}", response_model=ActionItemResponse)
def update_action_item(
    item_id: int,
    data: ActionItemUpdate,
    db: Session = Depends(get_db),
):
    # Update an action item's text, assignee, due date, or completion status
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    if data.text is not None:
        item.text = data.text
    if data.assignee is not None:
        item.assignee = data.assignee
    if data.due_date is not None:
        item.due_date = data.due_date
    if data.is_completed is not None:
        item.is_completed = data.is_completed

    db.commit()
    db.refresh(item)

    return ActionItemResponse.model_validate(item)


@router.delete("/action-items/{item_id}", status_code=204)
def delete_action_item(item_id: int, db: Session = Depends(get_db)):
    # Delete an action item
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    db.delete(item)
    db.commit()
    return None
