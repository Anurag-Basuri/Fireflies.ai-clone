# Models package - import all models so SQLAlchemy registers them
from app.models.user import User
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.speaker import Speaker
from app.models.transcript_segment import TranscriptSegment
from app.models.summary import Summary
from app.models.key_topic import KeyTopic
from app.models.action_item import ActionItem
from app.models.tag import Tag, MeetingTag
from app.models.comment import Comment
from app.models.soundbite import Soundbite

__all__ = [
    "User",
    "Meeting",
    "Participant",
    "Speaker",
    "TranscriptSegment",
    "Summary",
    "KeyTopic",
    "ActionItem",
    "Tag",
    "MeetingTag",
    "Comment",
    "Soundbite",
]
