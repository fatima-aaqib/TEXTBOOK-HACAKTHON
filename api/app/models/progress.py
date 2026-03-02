"""
User progress tracking model
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.db_base import Base


class UserProgress(Base):
    """
    Track user progress through chapters
    """
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Chapter identification
    chapter_id = Column(String(255), nullable=False)  # e.g., "module-1-ros2/01-introduction"
    module_name = Column(String(100), nullable=False)  # e.g., "ros2", "gazebo-unity", "isaac", "vla"

    # Progress tracking
    completed = Column(Boolean, default=False, nullable=False)
    reading_time_seconds = Column(Integer, default=0, nullable=False)  # Total time spent on chapter

    # Timestamps
    last_read_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationship
    user = relationship("User", back_populates="progress")

    def __repr__(self):
        return f"<UserProgress(user_id={self.user_id}, chapter={self.chapter_id}, completed={self.completed})>"

    def to_dict(self):
        """Convert progress to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "chapter_id": self.chapter_id,
            "module_name": self.module_name,
            "completed": self.completed,
            "reading_time_seconds": self.reading_time_seconds,
            "last_read_at": self.last_read_at.isoformat() if self.last_read_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
