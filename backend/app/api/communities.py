from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import Community, User
from app.schemas.community import CommunityCreate, CommunityResponse
from app.services.slug import slugify

router = APIRouter(prefix="/communities", tags=["communities"])


@router.post("", response_model=CommunityResponse, status_code=status.HTTP_201_CREATED)
def create_community(
    payload: CommunityCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    slug = slugify(payload.name)
    if db.query(Community).filter(Community.slug == slug).first():
        raise HTTPException(status_code=409, detail="Community already exists")

    topic = (payload.description or payload.name).strip()[:160]
    community = Community(
        name=payload.name,
        slug=slug,
        description=payload.description,
        banner_url=payload.banner_url,
        ai_topic=topic,
    )
    db.add(community)
    db.commit()
    db.refresh(community)
    return community


@router.get("", response_model=list[CommunityResponse])
def list_communities(db: Session = Depends(get_db)):
    return db.query(Community).order_by(Community.created_at.desc()).all()


@router.get("/{slug}", response_model=CommunityResponse)
def get_community(slug: str, db: Session = Depends(get_db)):
    community = db.query(Community).filter(Community.slug == slug).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    return community
