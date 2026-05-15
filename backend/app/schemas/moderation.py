from pydantic import BaseModel, Field


class ModerationDecision(BaseModel):
    status: str = Field(pattern="^(approved|review|blocked)$")
    reason: str | None = Field(default=None, max_length=500)
