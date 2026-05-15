from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_core_product_flow():
    suffix = uuid4().hex[:8]
    auth = client.post(
        "/api/auth/signup",
        json={
            "email": f"{suffix}@example.com",
            "username": f"user_{suffix}",
            "password": "password123",
        },
    )
    assert auth.status_code == 201
    token = auth.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    community = client.post(
        "/api/communities",
        json={"name": f"Builders {suffix}", "description": "AI product lab"},
        headers=headers,
    )
    assert community.status_code == 201
    slug = community.json()["slug"]

    post = client.post(
        "/api/posts",
        json={
            "title": "Global launch notes",
            "content": "This product needs a strong search and moderation layer.",
            "community_slug": slug,
        },
        headers=headers,
    )
    assert post.status_code == 201
    post_body = post.json()
    assert post_body["moderation_status"] == "approved"
    assert post_body["ai_summary"]

    vote = client.post(
        "/api/votes",
        json={"post_id": post_body["id"], "value": 1},
        headers=headers,
    )
    assert vote.status_code == 200
    assert vote.json()["vote_count"] >= 1

    comment = client.post(
        "/api/comments",
        json={"post_id": post_body["id"], "content": "First layer"},
        headers=headers,
    )
    assert comment.status_code == 201

    reply = client.post(
        "/api/comments",
        json={
            "post_id": post_body["id"],
            "content": "Nested reply",
            "parent_id": comment.json()["id"],
        },
        headers=headers,
    )
    assert reply.status_code == 201

    feed = client.get("/api/posts?sort=votes&page=1&page_size=5&q=launch")
    assert feed.status_code == 200
    assert feed.json()["total"] >= 1
    assert isinstance(feed.json()["items"], list)

    comments = client.get(f"/api/posts/{post_body['id']}/comments")
    assert comments.status_code == 200
    assert comments.json()[0]["replies"][0]["content"] == "Nested reply"
