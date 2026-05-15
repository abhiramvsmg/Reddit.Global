from sqlalchemy.orm import Session
from app.models.entities import Notification, User
from app.api.websockets import manager
import logging

logger = logging.getLogger("app")

class NotificationService:
    async def create_notification(
        self, 
        db: Session, 
        user_id: int, 
        type: str, 
        title: str, 
        message: str, 
        link_url: str | None = None
    ):
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            link_url=link_url
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        # Broadcast via WebSocket
        try:
            await manager.send_personal_message(
                {
                    "event": "notification",
                    "data": {
                        "id": notification.id,
                        "type": notification.type,
                        "title": notification.title,
                        "message": notification.message,
                        "link_url": notification.link_url,
                        "created_at": notification.created_at.isoformat()
                    }
                },
                user_id
            )
        except Exception as e:
            logger.error(f"Failed to send WebSocket notification to {user_id}: {str(e)}")
            
        return notification

    def mark_as_read(self, db: Session, notification_id: int, user_id: int):
        notification = db.query(Notification).filter(
            Notification.id == notification_id, 
            Notification.user_id == user_id
        ).first()
        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
        return notification

    def get_user_notifications(self, db: Session, user_id: int, limit: int = 20):
        return db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(Notification.created_at.desc()).limit(limit).all()

notification_service = NotificationService()
