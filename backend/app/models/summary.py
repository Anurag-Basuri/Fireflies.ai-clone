from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.db import Base


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    overview = Column(Text, nullable=True)
    bullet_notes_json = Column(Text, nullable=True)
    generated_by = Column(String(20), nullable=False, default="seed")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="summary")
