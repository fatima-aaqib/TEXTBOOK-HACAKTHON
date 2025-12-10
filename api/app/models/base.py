"""
Pydantic base models for request/response validation
T019: Create Pydantic base models
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional
from enum import Enum


class ProficiencyLevel(str, Enum):
    """User proficiency levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class BackgroundType(str, Enum):
    """Background area types"""
    HARDWARE = "hardware"
    SOFTWARE = "software"


# Base response model
class BaseResponse(BaseModel):
    """Base response with common fields"""
    success: bool = True
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)


# Error response model
class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str
    message: str
    status_code: int
    details: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)


# Pagination model
class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(1, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")

    @property
    def offset(self) -> int:
        """Calculate offset for database queries"""
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseResponse):
    """Paginated response with metadata"""
    total: int
    page: int
    page_size: int
    total_pages: int
    data: list

    model_config = ConfigDict(from_attributes=True)


# Authentication models
class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds

    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)

    model_config = ConfigDict(from_attributes=True)


class UserCreate(UserBase):
    """User creation request"""
    password: str = Field(..., min_length=8, max_length=100)
    hardware_proficiency: ProficiencyLevel = ProficiencyLevel.BEGINNER
    software_proficiency: ProficiencyLevel = ProficiencyLevel.BEGINNER


class UserResponse(UserBase):
    """User response"""
    id: str
    hardware_proficiency: ProficiencyLevel
    software_proficiency: ProficiencyLevel
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Chat models
class ChatMessage(BaseModel):
    """Chat message"""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1)

    model_config = ConfigDict(from_attributes=True)


class ChatRequest(BaseModel):
    """Chat completion request"""
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    include_context: bool = True

    model_config = ConfigDict(from_attributes=True)


class Citation(BaseModel):
    """Source citation for RAG responses"""
    module: str
    chapter: str
    section: Optional[str] = None
    relevance_score: float = Field(..., ge=0.0, le=1.0)

    model_config = ConfigDict(from_attributes=True)


class ChatResponse(BaseResponse):
    """Chat completion response"""
    answer: str
    session_id: str
    citations: list[Citation] = []

    model_config = ConfigDict(from_attributes=True)


# Translation models
class TranslateRequest(BaseModel):
    """Translation request"""
    text: str = Field(..., min_length=1)
    target_language: str = Field("ur", pattern="^[a-z]{2}$")
    preserve_code: bool = True

    model_config = ConfigDict(from_attributes=True)


class TranslateResponse(BaseResponse):
    """Translation response"""
    translated_text: str
    source_language: str
    target_language: str
    cached: bool = False

    model_config = ConfigDict(from_attributes=True)


# Personalization models
class UserProgress(BaseModel):
    """User progress tracking"""
    module_id: str
    chapter_id: str
    completed: bool
    completion_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class QuizAttempt(BaseModel):
    """Quiz attempt result"""
    quiz_id: str
    score: float = Field(..., ge=0.0, le=100.0)
    total_questions: int
    correct_answers: int
    time_spent_seconds: int

    model_config = ConfigDict(from_attributes=True)
