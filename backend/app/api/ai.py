from fastapi import APIRouter, Depends

from app.deps import get_current_user
from app.models import User
from app.schemas.ai import (
    AiStatusResponse,
    ModerationRequest,
    ModerationResponse,
    PostAssistRequest,
    PostAssistResponse,
)
from app.services.ai import ai_status, assist_post, moderate_text

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/post-assist", response_model=PostAssistResponse)
def post_assist(payload: PostAssistRequest, _: User = Depends(get_current_user)):
    return assist_post(payload.title, payload.content)


@router.post("/moderate", response_model=ModerationResponse)
def moderate(payload: ModerationRequest, _: User = Depends(get_current_user)):
    return moderate_text(payload.text)


@router.get("/status", response_model=AiStatusResponse)
def status(_: User = Depends(get_current_user)):
    return ai_status()
