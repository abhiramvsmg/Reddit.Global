from sqlalchemy import desc, func, literal
from sqlalchemy.orm import Session, joinedload
from app.models.entities import Post, Vote, Comment
from app.repositories.base import BaseRepository

class PostRepository(BaseRepository[Post]):
    def __init__(self):
        super().__init__(Post)

    def get_with_counts(self, db: Session, post_id: int, user_id: int | None = None):
        vote_count = db.query(func.coalesce(func.sum(Vote.value), 0)).filter(Vote.post_id == post_id).scalar()
        comment_count = db.query(func.count(Comment.id)).filter(Comment.post_id == post_id).scalar()
        
        user_vote = 0
        user_bookmarked = False
        if user_id:
            from app.models.entities import Bookmark
            vote = db.query(Vote).filter(Vote.post_id == post_id, Vote.user_id == user_id).first()
            if vote:
                user_vote = vote.value
            
            bookmark = db.query(Bookmark).filter(Bookmark.post_id == post_id, Bookmark.user_id == user_id).first()
            user_bookmarked = bookmark is not None

        post = db.query(Post).options(joinedload(Post.community), joinedload(Post.author)).filter(Post.id == post_id).first()
        return post, int(vote_count or 0), int(comment_count or 0), user_vote, user_bookmarked

    def list_with_counts(
        self, 
        db: Session, 
        *, 
        sort: str = "date", 
        q: str | None = None, 
        community_id: int | None = None,
        author_id: int | None = None,
        user_id: int | None = None,
        page: int = 1, 
        page_size: int = 10
    ):
        from app.models.entities import Bookmark
        vote_counts = (
            db.query(Vote.post_id.label("pid"), func.coalesce(func.sum(Vote.value), 0).label("vc"))
            .group_by(Vote.post_id)
            .subquery()
        )
        comment_counts = (
            db.query(Comment.post_id.label("pid"), func.count(Comment.id).label("cc"))
            .group_by(Comment.post_id)
            .subquery()
        )
        
        query = (
            db.query(
                Post,
                func.coalesce(vote_counts.c.vc, 0).label("vote_count"),
                func.coalesce(comment_counts.c.cc, 0).label("comment_count"),
            )
            .outerjoin(vote_counts, vote_counts.c.pid == Post.id)
            .outerjoin(comment_counts, comment_counts.c.pid == Post.id)
            .options(joinedload(Post.community), joinedload(Post.author))
        )

        if user_id:
            user_votes = db.query(Vote.post_id.label("pid"), Vote.value.label("uv")).filter(Vote.user_id == user_id).subquery()
            user_bookmarks = db.query(Bookmark.post_id.label("pid"), literal(1).label("ub")).filter(Bookmark.user_id == user_id).subquery()
            
            query = query.add_columns(
                func.coalesce(user_votes.c.uv, 0).label("user_vote"),
                func.coalesce(user_bookmarks.c.ub, 0).label("user_bookmarked")
            ).outerjoin(user_votes, user_votes.c.pid == Post.id).outerjoin(user_bookmarks, user_bookmarks.c.pid == Post.id)
        else:
            query = query.add_columns(
                literal(0).label("user_vote"),
                literal(0).label("user_bookmarked")
            )

        if q:
            search = f"%{q.lower()}%"
            query = query.filter(
                func.lower(Post.title).like(search)
                | func.lower(func.coalesce(Post.content, "")).like(search)
                | func.lower(func.coalesce(Post.ai_tags, "")).like(search)
            )
        
        if community_id:
            query = query.filter(Post.community_id == community_id)
        
        if author_id:
            query = query.filter(Post.author_id == author_id)

        # Count before pagination
        count_query = query.with_entities(func.count(Post.id))
        total = db.execute(count_query).scalar() or 0

        if sort == "votes":
            query = query.order_by(desc("vote_count"), Post.created_at.desc())
        else:
            query = query.order_by(Post.created_at.desc())

        items = query.offset((page - 1) * page_size).limit(page_size).all()
        
        return items, total


post_repository = PostRepository()
