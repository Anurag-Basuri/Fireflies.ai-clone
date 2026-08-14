from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.db import Base


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    text = Column(String(1000), nullable=False)
    assignee = Column(String(255), nullable=True)
    due_date = Column(Date, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="action_items")
