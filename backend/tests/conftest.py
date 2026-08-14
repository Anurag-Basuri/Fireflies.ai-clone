# Pytest test configuration and fixtures
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.db import Base, get_db
from app.main import app

# In-memory SQLite with StaticPool so all connections share the same memory DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Database session fixture for test isolation
@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


# FastAPI TestClient fixture with database override
@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# Mock LLM calls during unit tests to ensure fast, deterministic tests
@pytest.fixture(autouse=True)
def mock_llm_service():
    sample_summary = {
        "overview": "Test meeting overview summary.",
        "bullet_notes": ["Note 1", "Note 2"],
        "action_items": [{"text": "Action 1", "assignee": "Alice", "due_date": "2025-08-01"}],
        "key_topics": [{"title": "Topic 1", "start_time": 0.0}],
    }
    with patch("app.services.llm_service.generate_summary_with_llm", return_value=sample_summary), \
         patch("app.services.llm_service.ask_meeting_question", return_value="Test mock answer"):
        yield
