"""
Pydantic schemas for chat API
T060: Chat schemas with citations
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Citation(BaseModel):
    """Source citation for RAG responses"""
    text: str = Field(..., description="Chunk of text from source")
    source: str = Field(..., description="Chapter/file path")
    score: float = Field(..., description="Similarity score (0-1)")
    page: Optional[int] = Field(None, description="Page or section number")


class ChatMessageRequest(BaseModel):
    """Request schema for sending a chat message"""
    message: str = Field(..., min_length=1, max_length=2000, description="User's question")
    session_token: Optional[str] = Field(None, description="Session token for context")
    selected_text: Optional[str] = Field(None, max_length=1000, description="User-selected text for context")


class ChatMessageResponse(BaseModel):
    """Response schema for chat messages"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    citations: Optional[List[Citation]] = Field(None, description="Source citations for answer")
    token_count: Optional[int] = Field(None, description="Token count for this message")
    created_at: datetime = Field(..., description="Message timestamp")


class SessionResponse(BaseModel):
    """Response schema for chat session"""
    session_token: str = Field(..., description="Unique session identifier")
    messages: List[ChatMessageResponse] = Field(default_factory=list, description="Message history")
    created_at: datetime = Field(..., description="Session creation time")


class SessionCreateRequest(BaseModel):
    """Request schema for creating a new chat session"""
    user_id: Optional[int] = Field(None, description="User ID if authenticated")


class ChatHistoryResponse(BaseModel):
    """Response schema for chat history"""
    sessions: List[SessionResponse] = Field(..., description="List of chat sessions")
    total: int = Field(..., description="Total number of sessions")
