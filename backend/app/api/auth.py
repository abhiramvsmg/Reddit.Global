from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def build_token_response(user_id: int) -> TokenResponse:
    token, expires_at = create_access_token(str(user_id))
    return TokenResponse(
        access_token=token,
        expires_in=settings.access_token_expire_minutes * 60,
        expires_at=expires_at.isoformat(),
    )


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    username = payload.username.strip().lower()
    existing = (
        db.query(User)
        .filter(or_(User.email == email, User.username == username))
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Email or username already exists")

    role = "admin" if db.query(User.id).limit(1).first() is None else "user"
    user = User(
        email=email,
        username=username,
        password_hash=hash_password(payload.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return build_token_response(user.id)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return build_token_response(user.id)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
