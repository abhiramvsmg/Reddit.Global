from sqlalchemy import inspect, text

from app.db import engine


def ensure_development_schema() -> None:
    if not engine.url.drivername.startswith("sqlite"):
        return

    additions = {
        "users": {
            "avatar_url": "VARCHAR(500)",
            "bio": "VARCHAR(280)",
            "role": "VARCHAR(30) DEFAULT 'user'",
            "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        "communities": {
            "banner_url": "VARCHAR(500)",
            "ai_topic": "VARCHAR(160)",
            "member_count": "INTEGER DEFAULT 1",
            "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        "posts": {
            "ai_summary": "TEXT",
            "ai_tags": "VARCHAR(500)",
            "moderation_status": "VARCHAR(30) DEFAULT 'pending'",
            "moderation_reason": "VARCHAR(500)",
            "toxicity_score": "FLOAT DEFAULT 0.0",
            "language": "VARCHAR(12) DEFAULT 'en'",
            "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        "comments": {
            "parent_id": "INTEGER",
            "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
    }


    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    with engine.begin() as connection:
        for table, columns in additions.items():
            if table not in existing_tables:
                continue
            # Re-fetch columns for each table to avoid stale data
            current_columns = {col["name"] for col in inspect(connection).get_columns(table)}
            for column_name, definition in columns.items():
                if column_name not in current_columns:
                    try:
                        connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {column_name} {definition}"))
                    except Exception as e:
                        if "duplicate column" not in str(e).lower():
                            raise e



        indexes = {
            "posts": [
                "CREATE INDEX IF NOT EXISTS ix_posts_community_created ON posts (community_id, created_at)",
                "CREATE INDEX IF NOT EXISTS ix_posts_moderation_created ON posts (moderation_status, created_at)",
                "CREATE INDEX IF NOT EXISTS ix_posts_author_created ON posts (author_id, created_at)",
            ],
            "comments": [
                "CREATE INDEX IF NOT EXISTS ix_comments_post_parent_created ON comments (post_id, parent_id, created_at)",
            ],
            "votes": [
                "CREATE INDEX IF NOT EXISTS ix_votes_post_value ON votes (post_id, value)",
            ],
        }
        for table, statements in indexes.items():
            if table not in existing_tables:
                continue
            for statement in statements:
                connection.execute(text(statement))
