import json
import io
from typing import Optional

from sqlalchemy.orm import Session

from app.models.meeting import Meeting
from app.models.transcript_segment import TranscriptSegment
from app.models.summary import Summary
from app.models.action_item import ActionItem
from app.core.logging import logger


def export_meeting(db: Session, meeting_id: int, format: str) -> Optional[tuple[str, str, str]]:
    # Export meeting transcript and summary in the requested format
    # Returns (content, filename, content_type) or None if meeting not found
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        return None

    segments = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.sequence_index)
        .all()
    )

    summary = db.query(Summary).filter(Summary.meeting_id == meeting_id).first()

    action_items = (
        db.query(ActionItem)
        .filter(ActionItem.meeting_id == meeting_id)
        .all()
    )

    if format == "md":
        return _export_markdown(meeting, segments, summary, action_items)
    elif format == "txt":
        return _export_text(meeting, segments, summary, action_items)
    else:
        return _export_text(meeting, segments, summary, action_items)


def _export_markdown(meeting, segments, summary, action_items):
    # Generate Markdown export content
    lines = [f"# {meeting.title}\n"]
    lines.append(f"**Date:** {meeting.meeting_date}\n")
    if meeting.duration_seconds:
        mins = meeting.duration_seconds // 60
        lines.append(f"**Duration:** {mins} minutes\n")

    if summary:
        lines.append("\n## Summary\n")
        if summary.overview:
            lines.append(f"{summary.overview}\n")
        if summary.bullet_notes_json:
            notes = json.loads(summary.bullet_notes_json)
            lines.append("\n### Key Notes\n")
            for note in notes:
                lines.append(f"- {note}")

    if action_items:
        lines.append("\n## Action Items\n")
        for item in action_items:
            status = "✅" if item.is_completed else "⬜"
            line = f"- {status} {item.text}"
            if item.assignee:
                line += f" (Assigned: {item.assignee})"
            if item.due_date:
                line += f" [Due: {item.due_date}]"
            lines.append(line)

    if segments:
        lines.append("\n## Transcript\n")
        for seg in segments:
            speaker = seg.speaker.label if seg.speaker else "Unknown"
            mins = int(seg.start_time // 60)
            secs = int(seg.start_time % 60)
            lines.append(f"**[{mins:02d}:{secs:02d}] {speaker}:** {seg.content}\n")

    content = "\n".join(lines)
    filename = f"{meeting.title.replace(' ', '_')}.md"
    return content, filename, "text/markdown"


def _export_text(meeting, segments, summary, action_items):
    # Generate plain text export content
    lines = [f"{meeting.title}", "=" * len(meeting.title), ""]
    lines.append(f"Date: {meeting.meeting_date}")
    if meeting.duration_seconds:
        mins = meeting.duration_seconds // 60
        lines.append(f"Duration: {mins} minutes")
    lines.append("")

    if summary:
        lines.append("SUMMARY")
        lines.append("-" * 40)
        if summary.overview:
            lines.append(summary.overview)
            lines.append("")
        if summary.bullet_notes_json:
            notes = json.loads(summary.bullet_notes_json)
            lines.append("Key Notes:")
            for note in notes:
                lines.append(f"  * {note}")
        lines.append("")

    if action_items:
        lines.append("ACTION ITEMS")
        lines.append("-" * 40)
        for item in action_items:
            status = "[x]" if item.is_completed else "[ ]"
            line = f"  {status} {item.text}"
            if item.assignee:
                line += f" (Assigned: {item.assignee})"
            lines.append(line)
        lines.append("")

    if segments:
        lines.append("TRANSCRIPT")
        lines.append("-" * 40)
        for seg in segments:
            speaker = seg.speaker.label if seg.speaker else "Unknown"
            mins = int(seg.start_time // 60)
            secs = int(seg.start_time % 60)
            lines.append(f"[{mins:02d}:{secs:02d}] {speaker}: {seg.content}")

    content = "\n".join(lines)
    filename = f"{meeting.title.replace(' ', '_')}.txt"
    return content, filename, "text/plain"
