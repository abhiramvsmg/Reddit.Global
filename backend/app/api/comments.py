from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.deps import get_current_user
from app.models import Comment, Post, User
from app.schemas.comment import CommentCreate, CommentResponse
from app.services.comment_service import comment_service

router = APIRouter(tags=["comments"])


def serialize_comment(comment: Comment, children: dict[int | None, list[Comment]] | None = None) -> CommentResponse:
    replies = children.get(comment.id, []) if children is not None else sorted(comment.replies, key=lambda item: item.created_at)
    return CommentResponse(
        id=comment.id,
        content=comment.content,
        post_id=comment.post_id,
        author_id=comment.author_id,
        parent_id=comment.parent_id,
        created_at=comment.created_at,
        author_username=comment.author.username if comment.author else None,
        replies=[serialize_comment(reply, children) for reply in replies],
    )


@router.post("/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment, error = await comment_service.create_comment(db, payload, current_user)
    if error:
        raise HTTPException(status_code=404, detail=error)
    return serialize_comment(comment)



@router.get("/posts/{post_id}/comments", response_model=list[CommentResponse])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    if not db.get(Post, post_id):
        raise HTTPException(status_code=404, detail="Post not found")
    comments = (
        db.query(Comment)
        .options(joinedload(Comment.author))
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    children: dict[int | None, list[Comment]] = {}
    for comment in comments:
        children.setdefault(comment.parent_id, []).append(comment)
    return [serialize_comment(comment, children) for comment in children.get(None, [])]
