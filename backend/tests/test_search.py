# Backend API tests for global cross-meeting search and Ask AI
from app.models.user import User


# Helper to initialize default user in test database
def create_test_user(db_session):
    user = User(id=1, name="Test User", email="test@example.com")
    db_session.add(user)
    db_session.commit()
    return user


# Test global search across titles and transcripts
def test_global_search(client, db_session):
    create_test_user(db_session)

    client.post(
        "/api/v1/meetings",
        json={
            "title": "Quarterly Budget Review",
            "meeting_date": "2025-07-20",
            "participants": [{"name": "Alice"}],
            "transcript_text": "Alice: The financial forecast is ready.",
        },
    )

    # Search by title match
    res_title = client.get("/api/v1/search?q=Budget")
    assert res_title.status_code == 200
    data = res_title.json()
    assert data["total_results"] >= 1
    assert data["results"][0]["match_type"] == "title"

    # Search by spoken text match
    res_content = client.get("/api/v1/search?q=forecast")
    assert res_content.status_code == 200
    data_c = res_content.json()
    assert data_c["total_results"] >= 1
    assert data_c["results"][0]["match_type"] == "transcript"


# Test Ask AI endpoint returns structured answer
def test_ask_ai_endpoint(client, db_session):
    create_test_user(db_session)

    res = client.post(
        "/api/v1/meetings",
        json={
            "title": "Roadmap Q4 Sync",
            "meeting_date": "2025-07-20",
            "participants": [{"name": "Alice"}],
            "transcript_text": "Alice: We will launch the mobile app in November.",
        },
    )
    meeting_id = res.json()["id"]

    ask_res = client.post(
        f"/api/v1/meetings/{meeting_id}/ask",
        json={"question": "When is the mobile app launch?"},
    )
    assert ask_res.status_code == 200
    assert "answer" in ask_res.json()
    assert ask_res.json()["meeting_id"] == meeting_id
