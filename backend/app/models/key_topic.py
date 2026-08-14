from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.core.db import Base


class KeyTopic(Base):
    __tablename__ = "key_topics"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(500), nullable=False)
    start_time = Column(Float, nullable=True)
    order_index = Column(Integer, nullable=False, default=0)

    # Relationships
    meeting = relationship("Meeting", back_populates="key_topics")
