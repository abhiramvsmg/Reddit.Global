from sqlalchemy.orm import Session
from app.models.entities import Post, User, Community, Vote
from app.repositories.post_repository import post_repository
from app.services.ai import assist_post
from app.schemas.post import PostCreate

class PostService:
    def create_post(self, db: Session, payload: PostCreate, author: User):
        community = db.query(Community).filter(Community.slug == payload.community_slug).first()
        if not community:
            return None, "Community not found"

        ai_result = assist_post(payload.title, payload.content)
        
        post_data = {
            "title": payload.title,
            "content": payload.content,
            "image_url": str(payload.image_url) if payload.image_url else None,
            "link_url": str(payload.link_url) if payload.link_url else None,
            "ai_summary": ai_result.summary,
            "ai_tags": ",".join(ai_result.tags),
            "moderation_status": ai_result.moderation_status,
            "moderation_reason": None if ai_result.moderation_status == "approved" else ai_result.safety_note,
            "toxicity_score": ai_result.toxicity_score,
            "language": ai_result.language,
            "community_id": community.id,
            "author_id": author.id,
        }
        
        post = post_repository.create(db, obj_in=post_data)
        post.community = community
        post.author = author
        return post, None

    def get_user_vote(self, db: Session, post_id: int, user_id: int):
        vote = db.query(Vote).filter(Vote.user_id == user_id, Vote.post_id == post_id).first()
        return vote.value if vote else 0

    def get_user_votes_for_posts(self, db: Session, post_ids: list[int], user_id: int):
        votes = db.query(Vote).filter(Vote.user_id == user_id, Vote.post_id.in_(post_ids)).all()
        return {v.post_id: v.value for v in votes}

post_service = PostService()
