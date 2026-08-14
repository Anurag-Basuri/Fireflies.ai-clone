from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.db import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    meeting_date = Column(Date, nullable=False)
    duration_seconds = Column(Integer, nullable=True)
    media_url = Column(String(512), nullable=True)
    media_type = Column(String(50), default="placeholder")
    status = Column(String(20), default="processing", nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    owner = relationship("User", backref="meetings")
    participants = relationship(
        "Participant", back_populates="meeting", cascade="all, delete-orphan"
    )
    speakers = relationship(
        "Speaker", back_populates="meeting", cascade="all, delete-orphan"
    )
    transcript_segments = relationship(
        "TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan"
    )
    summary = relationship(
        "Summary",
        back_populates="meeting",
        uselist=False,
        cascade="all, delete-orphan",
    )
    key_topics = relationship(
        "KeyTopic", back_populates="meeting", cascade="all, delete-orphan"
    )
    action_items = relationship(
        "ActionItem", back_populates="meeting", cascade="all, delete-orphan"
    )
    comments = relationship(
        "Comment", back_populates="meeting", cascade="all, delete-orphan"
    )
    soundbites = relationship(
        "Soundbite", back_populates="meeting", cascade="all, delete-orphan"
    )
    meeting_tags = relationship(
        "MeetingTag", back_populates="meeting", cascade="all, delete-orphan"
    )
