from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ai, auth, bookmarks, comments, communities, moderation, notifications, posts, uploads, users, votes, websockets
from app.core.config import settings
from app.core.exceptions import GlobalExceptionMiddleware, setup_logging
from app.db import Base, engine
from app.db_migrations import ensure_development_schema

# Setup structured logging
setup_logging()

if settings.auto_create_tables:
    Base.metadata.create_all(bind=engine)
    ensure_development_schema()

app = FastAPI(title=settings.app_name, redirect_slashes=False)

# Add Global Exception Middleware
app.add_middleware(GlobalExceptionMiddleware)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(communities.router, prefix="/api")
app.include_router(posts.router, prefix="/api")
app.include_router(votes.router, prefix="/api")
app.include_router(comments.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(moderation.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(bookmarks.router)
app.include_router(notifications.router)
app.include_router(websockets.router)


@app.get("/health")
def health():
    return {"status": "ok"}
