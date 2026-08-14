from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.services.export_service import export_meeting

router = APIRouter(tags=["export"])


@router.get("/meetings/{meeting_id}/export")
def export(
    meeting_id: int,
    format: str = "md",
    db: Session = Depends(get_db),
):
    # Export meeting transcript and summary in the requested format
    if format not in ("md", "txt"):
        raise HTTPException(
            status_code=400,
            detail="Supported formats: md, txt",
        )

    result = export_meeting(db, meeting_id, format)
    if not result:
        raise HTTPException(status_code=404, detail="Meeting not found")

    content, filename, content_type = result

    return PlainTextResponse(
        content=content,
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
