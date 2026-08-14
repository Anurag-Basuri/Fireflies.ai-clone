# Backend API tests for action items CRUD and completion toggles
from app.models.user import User


# Helper to initialize default user in test database
def create_test_user(db_session):
    user = User(id=1, name="Test User", email="test@example.com")
    db_session.add(user)
    db_session.commit()
    return user


# Test creating and listing action items
def test_create_and_list_action_items(client, db_session):
    create_test_user(db_session)

    # Create meeting
    meeting_res = client.post(
        "/api/v1/meetings",
        json={
            "title": "Action Items Meeting",
            "meeting_date": "2025-07-20",
            "participants": [{"name": "Alice"}],
        },
    )
    meeting_id = meeting_res.json()["id"]

    # Create action item
    create_item_res = client.post(
        f"/api/v1/meetings/{meeting_id}/action-items",
        json={
            "text": "Send contract to client",
            "assignee": "Alice",
            "due_date": "2025-07-25",
        },
    )
    assert create_item_res.status_code == 201
    item = create_item_res.json()
    assert item["text"] == "Send contract to client"
    assert item["assignee"] == "Alice"
    assert item["is_completed"] is False

    # List action items
    list_res = client.get(f"/api/v1/meetings/{meeting_id}/action-items")
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) == 1


# Test toggling action item completion status
def test_toggle_action_item_completed(client, db_session):
    create_test_user(db_session)

    meeting_res = client.post(
        "/api/v1/meetings",
        json={
            "title": "Task Toggle Meeting",
            "meeting_date": "2025-07-20",
            "participants": [{"name": "Bob"}],
        },
    )
    meeting_id = meeting_res.json()["id"]

    item_res = client.post(
        f"/api/v1/meetings/{meeting_id}/action-items",
        json={"text": "Review PR"},
    )
    item_id = item_res.json()["id"]

    # Mark completed
    patch_res = client.patch(
        f"/api/v1/action-items/{item_id}",
        json={"is_completed": True},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["is_completed"] is True


# Test deleting action item
def test_delete_action_item(client, db_session):
    create_test_user(db_session)

    meeting_res = client.post(
        "/api/v1/meetings",
        json={
            "title": "Delete Item Meeting",
            "meeting_date": "2025-07-20",
            "participants": [{"name": "Bob"}],
        },
    )
    meeting_id = meeting_res.json()["id"]

    item_res = client.post(
        f"/api/v1/meetings/{meeting_id}/action-items",
        json={"text": "Temporary Item"},
    )
    item_id = item_res.json()["id"]

    del_res = client.delete(f"/api/v1/action-items/{item_id}")
    assert del_res.status_code == 204

    # Verify deleted
    list_res = client.get(f"/api/v1/meetings/{meeting_id}/action-items")
    assert len(list_res.json()) == 0
