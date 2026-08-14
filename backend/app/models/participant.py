from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.db import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    role = Column(String(100), nullable=True)

    # Relationships
    meeting = relationship("Meeting", back_populates="participants")
