from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    bio: Mapped[str | None] = mapped_column(String(280), nullable=True)
    role: Mapped[str] = mapped_column(String(30), default="user")

    posts: Mapped[list["Post"]] = relationship(back_populates="author")
    comments: Mapped[list["Comment"]] = relationship(back_populates="author")
    bookmarks: Mapped[list["Bookmark"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Community(Base, TimestampMixin):
    __tablename__ = "communities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(90), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    banner_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ai_topic: Mapped[str | None] = mapped_column(String(160), nullable=True)
    member_count: Mapped[int] = mapped_column(Integer, default=1)

    posts: Mapped[list["Post"]] = relationship(back_populates="community")


class Post(Base, TimestampMixin):
    __tablename__ = "posts"
    __table_args__ = (
        Index("ix_posts_community_created", "community_id", "created_at"),
        Index("ix_posts_moderation_created", "moderation_status", "created_at"),
        Index("ix_posts_author_created", "author_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(220), index=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_tags: Mapped[str | None] = mapped_column(String(500), nullable=True)
    moderation_status: Mapped[str] = mapped_column(String(30), default="pending")
    moderation_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)
    toxicity_score: Mapped[float] = mapped_column(Float, default=0.0)
    language: Mapped[str] = mapped_column(String(12), default="en")
    community_id: Mapped[int] = mapped_column(ForeignKey("communities.id"))
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    community: Mapped[Community] = relationship(back_populates="posts")
    author: Mapped[User] = relationship(back_populates="posts")
    comments: Mapped[list["Comment"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    votes: Mapped[list["Vote"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    bookmarks: Mapped[list["Bookmark"]] = relationship(back_populates="post", cascade="all, delete-orphan")


class Comment(Base, TimestampMixin):
    __tablename__ = "comments"
    __table_args__ = (
        Index("ix_comments_post_parent_created", "post_id", "parent_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    content: Mapped[str] = mapped_column(Text)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"))
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("comments.id"), nullable=True)

    post: Mapped[Post] = relationship(back_populates="comments")
    author: Mapped[User] = relationship(back_populates="comments")
    parent: Mapped["Comment | None"] = relationship(
        "Comment", remote_side=[id], back_populates="replies"
    )
    replies: Mapped[list["Comment"]] = relationship("Comment", back_populates="parent")


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_user_post_vote"),
        Index("ix_votes_post_value", "post_id", "value"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    value: Mapped[int] = mapped_column(Integer)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    post: Mapped[Post] = relationship(back_populates="votes")


class Bookmark(Base, TimestampMixin):
    __tablename__ = "bookmarks"
    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_user_post_bookmark"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"))

    user: Mapped[User] = relationship(back_populates="bookmarks")
    post: Mapped[Post] = relationship(back_populates="bookmarks")


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    type: Mapped[str] = mapped_column(String(50))  # comment, vote, system
    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped[User] = relationship(back_populates="notifications")


class ModerationLog(Base, TimestampMixin):
    __tablename__ = "moderation_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"))
    moderator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(50))  # approved, blocked, review
    reason: Mapped[str | None] = mapped_column(String(500), nullable=True)

    post: Mapped[Post] = relationship()
    moderator: Mapped[User] = relationship()

