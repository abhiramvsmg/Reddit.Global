from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.entities import Post, Vote, User
from app.api.websockets import manager
import logging

logger = logging.getLogger("app")

class VoteService:
    async def cast_vote(self, db: Session, post_id: int, user_id: int, value: int):
        post = db.get(Post, post_id)
        if not post:
            return None, "Post not found"

        existing = (
            db.query(Vote)
            .filter(Vote.post_id == post_id, Vote.user_id == user_id)
            .first()
        )
        
        if value == 0 and existing:
            db.delete(existing)
        elif existing:
            existing.value = value
        elif value != 0:
            db.add(Vote(post_id=post_id, user_id=user_id, value=value))

        db.commit()
        
        vote_count = db.query(func.coalesce(func.sum(Vote.value), 0)).filter(Vote.post_id == post_id).scalar()
        vote_count = int(vote_count or 0)
        
        # Broadcast vote update
        try:
            await manager.broadcast({
                "event": "vote_update",
                "data": {
                    "post_id": post_id,
                    "vote_count": vote_count
                }
            })
        except Exception as e:
            logger.error(f"Failed to broadcast vote update: {str(e)}")

        return {
            "post_id": post_id,
            "vote_count": vote_count,
            "user_vote": value
        }, None

vote_service = VoteService()
