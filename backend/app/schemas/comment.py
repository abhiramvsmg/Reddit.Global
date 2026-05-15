from datetime import datetime

from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    post_id: int
    content: str = Field(min_length=1, max_length=2000)
    parent_id: int | None = None


class CommentResponse(BaseModel):
    id: int
    content: str
    post_id: int
    author_id: int
    parent_id: int | None = None
    created_at: datetime
    author_username: str | None = None
    replies: list["CommentResponse"] = Field(default_factory=list)

    model_config = {"from_attributes": True}
