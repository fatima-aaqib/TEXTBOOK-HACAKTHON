"""
Initialize database tables - Simple version
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models.db_base import Base
from app.models.chat import ChatSession, ChatMessage
from app.db.session import engine


async def init_db():
    """Create all database tables"""
    print("Creating database tables...")

    async with engine.begin() as conn:
        # Drop all tables first
        await conn.run_sync(Base.metadata.drop_all)

        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

    print("Database tables created successfully!")
    print("\nCreated tables:")
    for table_name in Base.metadata.tables.keys():
        print(f"  - {table_name}")


if __name__ == "__main__":
    asyncio.run(init_db())
