from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Global Reddit Clone API"
    database_url: str = "sqlite:///./reddit_clone.db"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    cors_origins: list[str] = ["*"]
    ai_provider: str = "local"
    ai_api_key: str | None = None
    ai_base_url: str | None = None
    ai_model: str = "production-model"
    ai_timeout_seconds: float = 12.0
    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: str | None = None
    cloudinary_api_secret: str | None = None
    default_page_size: int = 20
    max_page_size: int = 50
    auto_create_tables: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
