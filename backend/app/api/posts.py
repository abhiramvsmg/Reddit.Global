from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import get_db
from app.deps import get_current_user, get_current_user_optional
from app.models import Community, Post, User, Vote, Bookmark
from app.schemas.pagination import Page
from app.schemas.post import PostCreate, PostResponse
from app.services.post_service import post_service
from app.repositories.post_repository import post_repository

router = APIRouter(tags=["posts"])


def serialize_post(post: Post, vote_count: int = 0, comment_count: int = 0, user_vote: int = 0, user_bookmarked: bool = False) -> PostResponse:
    return PostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        image_url=post.image_url,
        link_url=post.link_url,
        community_id=post.community_id,
        author_id=post.author_id,
        created_at=post.created_at,
        vote_count=vote_count,
        comment_count=comment_count,
        community_slug=post.community.slug if post.community else None,
        author_username=post.author.username if post.author else None,
        ai_summary=post.ai_summary,
        ai_tags=post.ai_tags,
        moderation_status=post.moderation_status,
        moderation_reason=post.moderation_reason,
        toxicity_score=post.toxicity_score,
        language=post.language,
        user_vote=user_vote,
        user_bookmarked=user_bookmarked,
    )


@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post, error = post_service.create_post(db, payload, current_user)
    if error:
        raise HTTPException(status_code=404, detail=error)
    return serialize_post(post)


@router.get("/posts", response_model=Page[PostResponse])
def list_posts(
    sort: str = Query(default="date", pattern="^(date|votes)$"),
    q: str | None = Query(default=None, min_length=2, max_length=120),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=settings.default_page_size, ge=1, le=settings.max_page_size),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    user_id = current_user.id if current_user else None
    items, total = post_repository.list_with_counts(
        db, sort=sort, q=q, page=page, page_size=page_size, user_id=user_id
    )

    serialized_items = [
        serialize_post(row[0], row[1], row[2], row[3], row[4])
        for row in items
    ]

    return Page(
        items=serialized_items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/posts/{post_id}", response_model=PostResponse)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    user_id = current_user.id if current_user else None
    post, vote_count, comment_count, user_vote, user_bookmarked = post_repository.get_with_counts(db, post_id, user_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return serialize_post(post, vote_count, comment_count, user_vote, user_bookmarked)


@router.get("/communities/{slug}/posts", response_model=Page[PostResponse])
def list_community_posts(
    slug: str,
    sort: str = Query(default="date", pattern="^(date|votes)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=settings.default_page_size, ge=1, le=settings.max_page_size),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    community = db.query(Community).filter(Community.slug == slug).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    user_id = current_user.id if current_user else None
    items, total = post_repository.list_with_counts(
        db, sort=sort, community_id=community.id, page=page, page_size=page_size, user_id=user_id
    )
    
    serialized_items = [
        serialize_post(row[0], row[1], row[2], row[3], row[4])
        for row in items
    ]
    
    return Page(
        items=serialized_items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/users/{username}/posts", response_model=Page[PostResponse])
def list_user_posts(
    username: str,
    sort: str = Query(default="date", pattern="^(date|votes)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=settings.default_page_size, ge=1, le=settings.max_page_size),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_id = current_user.id if current_user else None
    items, total = post_repository.list_with_counts(
        db, sort=sort, author_id=user.id, page=page, page_size=page_size, user_id=user_id
    )
    
    serialized_items = [
        serialize_post(row[0], row[1], row[2], row[3], row[4])
        for row in items
    ]
    
    return Page(
        items=serialized_items,
        total=total,
        page=page,
        page_size=page_size,
    )
