from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.deps import get_current_user
from app.models.entities import User
from app.services.bookmark_service import bookmark_service
from app.schemas.post import PostResponse
# We can't import PostResponse directly if it causes circular import, but let's assume it's fine or use a simplified schema

router = APIRouter(tags=["bookmarks"])

@router.post("/api/posts/{post_id}/bookmark")
def toggle_bookmark(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result, error = bookmark_service.toggle_bookmark(db, current_user.id, post_id)
    if error:
        raise HTTPException(status_code=404, detail=error)
    return result

@router.get("/api/users/me/bookmarks")
def list_my_bookmarks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # For simplicity, we return posts. In a real app, we'd use serialize_post from posts API
    from app.api.posts import serialize_post
    posts = bookmark_service.get_user_bookmarks(db, current_user.id)
    return [serialize_post(p, current_user.id) for p in posts]
