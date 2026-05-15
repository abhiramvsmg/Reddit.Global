from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class PostCreate(BaseModel):
    title: str = Field(min_length=3, max_length=220)
    content: str | None = None
    image_url: HttpUrl | None = None
    link_url: HttpUrl | None = None
    community_slug: str


class PostResponse(BaseModel):
    id: int
    title: str
    content: str | None = None
    image_url: str | None = None
    link_url: str | None = None
    community_id: int
    author_id: int
    created_at: datetime
    vote_count: int = 0
    comment_count: int = 0
    community_slug: str | None = None
    author_username: str | None = None
    ai_summary: str | None = None
    ai_tags: str | None = None
    moderation_status: str = "pending"
    moderation_reason: str | None = None
    toxicity_score: float = 0.0
    language: str = "en"
    user_vote: int = 0

    model_config = {"from_attributes": True}
