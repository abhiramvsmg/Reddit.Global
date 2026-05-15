from pydantic import BaseModel, Field


class VoteRequest(BaseModel):
    post_id: int
    value: int = Field(ge=-1, le=1)


class VoteResponse(BaseModel):
    post_id: int
    vote_count: int
    user_vote: int
