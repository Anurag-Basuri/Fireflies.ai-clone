# Backend API tests for transcript retrieval and in-transcript search
from app.models.user import User


# Helper to initialize default user in test database
def create_test_user(db_session):
    user = User(id=1, name="Test User", email="test@example.com")
    db_session.add(user)
    db_session.commit()
    return user


# Test getting transcript segments
def test_get_transcript_segments(client, db_session):
    create_test_user(db_session)

    res = client.post(
        "/api/v1/meetings",
        json={
            "title": "Transcript Retrieval Meeting",
            "meeting_date": "2025-07-20",
            "participants": [{"name": "Alice"}],
            "transcript_text": "Alice: First sentence.\nAlice: Second sentence.",
        },
    )
    meeting_id = res.json()["id"]

    t_res = client.get(f"/api/v1/meetings/{meeting_id}/transcript")
    assert t_res.status_code == 200
    segments = t_res.json()
    assert len(segments) == 2
    assert "First sentence" in segments[0]["content"]
    assert "Second sentence" in segments[1]["content"]


# Test in-transcript search with match offsets
def test_search_transcript_with_offsets(client, db_session):
    create_test_user(db_session)

    res = client.post(
        "/api/v1/meetings",
        json={
            "title": "Search Transcript Meeting",
            "meeting_date": "2025-07-20",
            "participants": [{"name": "Alice"}],
            "transcript_text": "Alice: The Kubernetes deployment succeeded.\nAlice: No errors found in deployment.",
        },
    )
    meeting_id = res.json()["id"]

    search_res = client.get(f"/api/v1/meetings/{meeting_id}/transcript/search?q=deployment")
    assert search_res.status_code == 200
    data = search_res.json()
    assert data["total_matches"] == 2
    assert len(data["matches"]) == 2
    assert len(data["matches"][0]["match_offsets"]) == 1
