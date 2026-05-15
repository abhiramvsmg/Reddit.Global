"""initial global schema

Revision ID: 20260506_0001
Revises:
Create Date: 2026-05-06
"""

from alembic import op
import sqlalchemy as sa

revision = "20260506_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("username", sa.String(50), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("bio", sa.String(280), nullable=True),
        sa.Column("role", sa.String(30), nullable=False, server_default="user"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "communities",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(80), nullable=False, unique=True),
        sa.Column("slug", sa.String(90), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("banner_url", sa.String(500), nullable=True),
        sa.Column("ai_topic", sa.String(160), nullable=True),
        sa.Column("member_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "posts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(220), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("link_url", sa.String(500), nullable=True),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("ai_tags", sa.String(500), nullable=True),
        sa.Column("moderation_status", sa.String(30), nullable=False, server_default="pending"),
        sa.Column("moderation_reason", sa.String(500), nullable=True),
        sa.Column("toxicity_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("language", sa.String(12), nullable=False, server_default="en"),
        sa.Column("community_id", sa.Integer(), sa.ForeignKey("communities.id"), nullable=False),
        sa.Column("author_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "comments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("post_id", sa.Integer(), sa.ForeignKey("posts.id"), nullable=False),
        sa.Column("author_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("parent_id", sa.Integer(), sa.ForeignKey("comments.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "votes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("value", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("post_id", sa.Integer(), sa.ForeignKey("posts.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("user_id", "post_id", name="uq_user_post_vote"),
    )
    op.create_index("ix_posts_community_created", "posts", ["community_id", "created_at"])
    op.create_index("ix_posts_moderation_created", "posts", ["moderation_status", "created_at"])
    op.create_index("ix_posts_author_created", "posts", ["author_id", "created_at"])
    op.create_index("ix_comments_post_parent_created", "comments", ["post_id", "parent_id", "created_at"])
    op.create_index("ix_votes_post_value", "votes", ["post_id", "value"])


def downgrade() -> None:
    op.drop_index("ix_votes_post_value", table_name="votes")
    op.drop_index("ix_comments_post_parent_created", table_name="comments")
    op.drop_index("ix_posts_author_created", table_name="posts")
    op.drop_index("ix_posts_moderation_created", table_name="posts")
    op.drop_index("ix_posts_community_created", table_name="posts")
    op.drop_table("votes")
    op.drop_table("comments")
    op.drop_table("posts")
    op.drop_table("communities")
    op.drop_table("users")
