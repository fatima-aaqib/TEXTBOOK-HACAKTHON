"""
SQLAlchemy models for chat functionality
T060: Chat database models for sessions and messages
"""
from typing import Optional, List
from sqlalchemy import String, Text, Integer, Float, ForeignKey, Boolean, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
import uuid
from app.models.db_base import Base, TimestampMixin, UUIDMixin


class ChatSession(Base, UUIDMixin, TimestampMixin):
    """Chat session model"""
    __tablename__ = "chat_sessions"

    user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    session_token: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationship to messages
    messages: Mapped[List["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at"
    )


class ChatMessage(Base, UUIDMixin, TimestampMixin):
    """Chat message model"""
    __tablename__ = "chat_messages"

    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("chat_sessions.id"), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # 'user' or 'assistant'
    content: Mapped[str] = mapped_column(Text, nullable=False)
    retrieved_chunks: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # RAG context chunks
    token_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Relationship to session
    session: Mapped["ChatSession"] = relationship("ChatSession", back_populates="messages")
