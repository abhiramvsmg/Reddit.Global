from sqlalchemy.orm import Session
from app.models.entities import Comment, Post, User
from app.services.notification_service import notification_service
import logging

logger = logging.getLogger("app")

class CommentService:
    async def create_comment(self, db: Session, payload, author: User):
        post = db.get(Post, payload.post_id)
        if not post:
            return None, "Post not found"
            
        if payload.parent_id:
            parent = db.get(Comment, payload.parent_id)
            if not parent or parent.post_id != payload.post_id:
                return None, "Parent comment not found"
        
        comment = Comment(
            content=payload.content,
            post_id=payload.post_id,
            author_id=author.id,
            parent_id=payload.parent_id,
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        # Notify post author if it's not the same person
        if post.author_id != author.id:
            try:
                await notification_service.create_notification(
                    db,
                    user_id=post.author_id,
                    type="comment",
                    title="New comment on your post",
                    message=f"{author.username} commented: {comment.content[:50]}...",
                    link_url=f"/posts/{post.id}"
                )
            except Exception as e:
                logger.error(f"Failed to send notification for comment: {str(e)}")
                
        return comment, None

comment_service = CommentService()
