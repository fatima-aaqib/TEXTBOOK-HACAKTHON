"""
Environment configuration using Pydantic Settings
T016: Setup environment configuration
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database
    DATABASE_URL: str

    # Qdrant Vector Database
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_PATH: Optional[str] = None  # For local Qdrant storage
    QDRANT_COLLECTION_NAME: str = "physical_ai_textbook"

    # OpenAI API (optional, for backward compatibility)
    OPENAI_API_KEY: Optional[str] = None

    # Gemini API
    GEMINI_API_KEY: str

    # Google Cloud Translation (optional)
    GOOGLE_CLOUD_API_KEY: Optional[str] = None

    # JWT Authentication
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Application
    ENVIRONMENT: str = "development"

    # Rate Limiting
    RATE_LIMIT_ANONYMOUS: int = 10
    RATE_LIMIT_AUTHENTICATED: int = 100

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
