from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.deps import get_current_user
from app.models.entities import User
from app.services.notification_service import notification_service
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(tags=["notifications"])

class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    link_url: str | None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/api/users/me/notifications", response_model=list[NotificationResponse])
def list_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return notification_service.get_user_notifications(db, current_user.id)

@router.patch("/api/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = notification_service.mark_as_read(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification
