from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    expires_at: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    avatar_url: str | None = None
    bio: str | None = None
    role: str = "user"

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=50)
    avatar_url: str | None = Field(default=None, max_length=500)
    bio: str | None = Field(default=None, max_length=280)
