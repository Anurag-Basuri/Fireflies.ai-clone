# Backend API tests for meetings CRUD, filtering, and upload
from app.models.user import User
from app.models.meeting import Meeting


# Helper to initialize default user in test database
def create_test_user(db_session):
    user = User(id=1, name="Test User", email="test@example.com")
    db_session.add(user)
    db_session.commit()
    return user


# Test creating a meeting with pasted transcript and participants
def test_create_meeting(client, db_session):
    create_test_user(db_session)

    payload = {
        "title": "Sprint Planning Test Meeting",
        "meeting_date": "2025-07-20",
        "duration_seconds": 1800,
        "participants": [
            {"name": "Alice Smith", "email": "alice@example.com", "role": "Lead"},
            {"name": "Bob Jones", "email": "bob@example.com", "role": "Dev"},
        ],
        "transcript_text": "Alice Smith: Let's discuss our priorities.\nBob Jones: I'll complete the API docs by Friday.",
    }

    response = client.post("/api/v1/meetings", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Sprint Planning Test Meeting"
    assert len(data["participants"]) == 2
    assert data["status"] == "ready"
    assert len(data["speakers"]) >= 1
    assert data["summary"] is not None


# Test listing meetings with search query and pagination
def test_list_meetings_with_search(client, db_session):
    create_test_user(db_session)

    # Create two meetings
    client.post(
        "/api/v1/meetings",
        json={
            "title": "Architecture Deep Dive",
            "meeting_date": "2025-07-20",
            "participants": [{"name": "Alice"}],
            "transcript_text": "Alice: Architecture overview...",
        },
    )
    client.post(
        "/api/v1/meetings",
        json={
            "title": "Marketing Campaign Sync",
            "meeting_date": "2025-07-21",
            "participants": [{"name": "Bob"}],
            "transcript_text": "Bob: Campaign updates...",
        },
    )

    # Search for architecture
    response = client.get("/api/v1/meetings?q=Architecture")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Architecture Deep Dive"


# Test updating meeting title and metadata
def test_update_meeting(client, db_session):
    create_test_user(db_session)

    create_res = client.post(
        "/api/v1/meetings",
        json={
            "title": "Initial Title",
            "meeting_date": "2025-07-20",
            "participants": [{"name": "Alice"}],
        },
    )
    meeting_id = create_res.json()["id"]

    update_res = client.patch(
        f"/api/v1/meetings/{meeting_id}",
        json={"title": "Updated Title Name"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Title Name"


# Test deleting meeting cascades
def test_delete_meeting(client, db_session):
    create_test_user(db_session)

    create_res = client.post(
        "/api/v1/meetings",
        json={
            "title": "Meeting to Delete",
            "meeting_date": "2025-07-20",
            "participants": [{"name": "Alice"}],
            "transcript_text": "Alice: Hello world",
        },
    )
    meeting_id = create_res.json()["id"]

    delete_res = client.delete(f"/api/v1/meetings/{meeting_id}")
    assert delete_res.status_code == 204

    get_res = client.get(f"/api/v1/meetings/{meeting_id}")
    assert get_res.status_code == 404
