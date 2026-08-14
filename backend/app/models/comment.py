from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.db import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    segment_id = Column(
        Integer,
        ForeignKey("transcript_segments.id", ondelete="CASCADE"),
        nullable=True,
    )
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="comments")
    segment = relationship("TranscriptSegment", back_populates="comments")
    user = relationship("User", backref="comments")
