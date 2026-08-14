from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.db import Base


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)

    # Relationships
    meeting_tags = relationship(
        "MeetingTag", back_populates="tag", cascade="all, delete-orphan"
    )


class MeetingTag(Base):
    __tablename__ = "meeting_tags"

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id = Column(
        Integer,
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    )

    # Relationships
    meeting = relationship("Meeting", back_populates="meeting_tags")
    tag = relationship("Tag", back_populates="meeting_tags")
