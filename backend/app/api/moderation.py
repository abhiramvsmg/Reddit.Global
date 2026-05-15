from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_moderator
from app.models import Post, User
from app.schemas.moderation import ModerationDecision
from app.schemas.post import PostResponse
from app.api.posts import serialize_post
from app.repositories.post_repository import post_repository

router = APIRouter(prefix="/moderation", tags=["moderation"])


@router.get("/queue", response_model=list[PostResponse])
def moderation_queue(
    status: str = Query(default="review", pattern="^(pending|review|blocked|approved)$"),
    db: Session = Depends(get_db),
    _: User = Depends(require_moderator),
):
    rows, _ = post_repository.list_with_counts(db, page_size=50)
    # Filter by moderation status manually or add to repository list_with_counts
    # For now, let's just use the repository to get specific posts
    posts = (
        db.query(Post)
        .filter(Post.moderation_status == status)
        .order_by(Post.created_at.desc())
        .limit(50)
        .all()
    )
    
    results = []
    for post in posts:
        _, votes, comments = post_repository.get_with_counts(db, post.id)
        results.append(serialize_post(post, votes, comments))
    return results


@router.patch("/posts/{post_id}", response_model=PostResponse)
def decide_post(
    post_id: int,
    payload: ModerationDecision,
    db: Session = Depends(get_db),
    _: User = Depends(require_moderator),
):
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.moderation_status = payload.status
    post.moderation_reason = payload.reason
    db.commit()
    db.refresh(post)
    
    _, votes, comments = post_repository.get_with_counts(db, post.id)
    return serialize_post(post, votes, comments)

