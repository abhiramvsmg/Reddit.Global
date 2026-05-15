from pydantic import BaseModel, Field


class PostAssistRequest(BaseModel):
    title: str = Field(min_length=3, max_length=220)
    content: str | None = None


class PostAssistResponse(BaseModel):
    improved_title: str
    summary: str
    tags: list[str]
    language: str
    toxicity_score: float
    moderation_status: str
    safety_note: str
    suggested_body: str | None = None
    tone: str = "clear"
    provider: str = "local"


class ModerationRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)


class ModerationResponse(BaseModel):
    status: str
    reason: str | None = None
    toxicity_score: float
    labels: list[str]


class AiStatusResponse(BaseModel):
    provider: str
    model: str
    connected: bool
    mode: str
