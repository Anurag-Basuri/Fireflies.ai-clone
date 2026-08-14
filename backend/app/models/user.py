from sqlalchemy import Column, Integer, String, DateTime, func


from app.core.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    avatar_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
