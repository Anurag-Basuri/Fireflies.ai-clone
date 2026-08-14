from sqlalchemy import Column, Integer, Float, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.db import Base


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    speaker_id = Column(
        Integer, ForeignKey("speakers.id", ondelete="SET NULL"), nullable=True
    )
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    content = Column(Text, nullable=False)
    sequence_index = Column(Integer, nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="transcript_segments")
    speaker = relationship("Speaker", back_populates="transcript_segments")
    comments = relationship(
        "Comment", back_populates="segment", cascade="all, delete-orphan"
    )
    soundbites = relationship(
        "Soundbite", back_populates="segment", cascade="all, delete-orphan"
    )
