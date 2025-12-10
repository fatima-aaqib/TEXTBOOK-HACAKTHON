"""
Environment configuration using Pydantic Settings
T016: Setup environment configuration
"""
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database
    DATABASE_URL: str

    # Qdrant Vector Database
    QDRANT_URL: str
    QDRANT_API_KEY: str

    # OpenAI API
    OPENAI_API_KEY: str

    # Google Cloud Translation
    GOOGLE_CLOUD_API_KEY: str

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
