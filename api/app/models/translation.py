"""
Translation cache model for storing translated content
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.models.db_base import Base


class TranslationCache(Base):
    """
    Cache translated content to avoid redundant API calls to Google Translate
    """
    __tablename__ = "translation_cache"

    id = Column(Integer, primary_key=True, index=True)

    # Content identification
    chapter_id = Column(String(255), nullable=False, index=True)  # e.g., "module-1-ros2/01-introduction"
    language = Column(String(10), nullable=False, index=True)  # ISO 639-1 code (e.g., "ur" for Urdu)
    original_hash = Column(String(64), nullable=False)  # SHA-256 hash of original content

    # Translated content
    translated_content = Column(Text, nullable=False)  # Full translated markdown

    # Cache management
    cached_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)  # NULL = no expiration
    hit_count = Column(Integer, default=0, nullable=False)  # Track cache usage

    # Unique constraint: one translation per chapter+language+hash combination
    __table_args__ = (
        UniqueConstraint('chapter_id', 'language', 'original_hash', name='_chapter_lang_hash_uc'),
    )

    def __repr__(self):
        return f"<TranslationCache(chapter={self.chapter_id}, lang={self.language}, hits={self.hit_count})>"

    def to_dict(self):
        """Convert translation cache to dictionary"""
        return {
            "id": self.id,
            "chapter_id": self.chapter_id,
            "language": self.language,
            "original_hash": self.original_hash,
            "translated_content": self.translated_content,
            "cached_at": self.cached_at.isoformat() if self.cached_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "hit_count": self.hit_count
        }
