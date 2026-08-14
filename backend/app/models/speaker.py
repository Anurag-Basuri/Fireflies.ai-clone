from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.db import Base


class Speaker(Base):
    __tablename__ = "speakers"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    label = Column(String(100), nullable=False)
    color_hex = Column(String(7), nullable=False, default="#6366F1")

    # Optional link to a known participant
    participant_id = Column(
        Integer, ForeignKey("participants.id"), nullable=True
    )

    # Relationships
    meeting = relationship("Meeting", back_populates="speakers")
    transcript_segments = relationship("TranscriptSegment", back_populates="speaker")
