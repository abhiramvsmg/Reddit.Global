from datetime import datetime

from pydantic import BaseModel, Field


class CommunityCreate(BaseModel):
    name: str = Field(min_length=3, max_length=80)
    description: str | None = Field(default=None, max_length=500)
    banner_url: str | None = Field(default=None, max_length=500)


class CommunityResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    banner_url: str | None = None
    ai_topic: str | None = None
    member_count: int = 1
    created_at: datetime

    model_config = {"from_attributes": True}
