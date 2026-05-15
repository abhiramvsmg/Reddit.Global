from sqlalchemy.orm import Session
from app.models.entities import Bookmark, Post, User
import logging

logger = logging.getLogger("app")

class BookmarkService:
    def toggle_bookmark(self, db: Session, user_id: int, post_id: int):
        post = db.get(Post, post_id)
        if not post:
            return None, "Post not found"
            
        existing = db.query(Bookmark).filter(
            Bookmark.user_id == user_id,
            Bookmark.post_id == post_id
        ).first()
        
        if existing:
            db.delete(existing)
            db.commit()
            return {"bookmarked": False}, None
        else:
            bookmark = Bookmark(user_id=user_id, post_id=post_id)
            db.add(bookmark)
            db.commit()
            return {"bookmarked": True}, None

    def get_user_bookmarks(self, db: Session, user_id: int):
        return db.query(Post).join(Bookmark).filter(Bookmark.user_id == user_id).all()

bookmark_service = BookmarkService()
