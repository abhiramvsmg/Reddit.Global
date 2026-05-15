from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import get_db
from app.models import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            issuer=settings.app_name,
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user_id = int(user_id)
    except (JWTError, TypeError, ValueError) as exc:
        raise credentials_exception from exc

    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user


def require_moderator(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in {"moderator", "admin"}:
        raise HTTPException(status_code=403, detail="Moderator access required")
    return current_user


def get_current_user_optional(
    db: Session = Depends(get_db),
    token: str | None = Depends(OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)),
) -> User | None:
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            issuer=settings.app_name,
        )
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return db.get(User, int(user_id))
    except (JWTError, TypeError, ValueError):
        return None
