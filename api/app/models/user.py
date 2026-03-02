"""
User model for authentication, personalization, and chat sessions
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.models.db_base import Base


class ProficiencyLevel(str, enum.Enum):
    """Proficiency levels for hardware and software skills"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class User(Base):
    """
    User model for authenticated users with personalization
    Anonymous users will have chat sessions without a user_id
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)

    # Proficiency levels for personalization
    hardware_level = Column(
        SQLEnum(ProficiencyLevel),
        nullable=False,
        default=ProficiencyLevel.BEGINNER
    )
    software_level = Column(
        SQLEnum(ProficiencyLevel),
        nullable=False,
        default=ProficiencyLevel.BEGINNER
    )

    # Account status and timestamps
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        """Convert user to dictionary (without password)"""
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "full_name": self.full_name,
            "hardware_level": self.hardware_level.value if self.hardware_level else None,
            "software_level": self.software_level.value if self.software_level else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
            "is_active": self.is_active
        }
