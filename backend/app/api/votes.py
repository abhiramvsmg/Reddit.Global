from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas.vote import VoteRequest, VoteResponse
from app.services.vote_service import vote_service

router = APIRouter(prefix="/votes", tags=["votes"])


@router.post("", response_model=VoteResponse)
async def vote(
    payload: VoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result, error = await vote_service.cast_vote(
        db, payload.post_id, current_user.id, payload.value
    )
    if error:
        raise HTTPException(status_code=404, detail=error)
    
    return VoteResponse(**result)

