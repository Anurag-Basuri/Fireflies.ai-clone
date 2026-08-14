from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.db import Base


class Soundbite(Base):
    __tablename__ = "soundbites"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    segment_id = Column(
        Integer,
        ForeignKey("transcript_segments.id", ondelete="CASCADE"),
        nullable=True,
    )
    title = Column(String(500), nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="soundbites")
    segment = relationship("TranscriptSegment", back_populates="soundbites")
