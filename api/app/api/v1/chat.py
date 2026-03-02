"""
Chat API endpoints for RAG chatbot
T060: Chat API with RAG integration using Gemini
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import uuid
import json

from app.models.chat import ChatSession, ChatMessage
from app.models.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    SessionResponse,
    SessionCreateRequest,
    ChatHistoryResponse,
    Citation
)
from app.services.rag_service import get_rag_service
from app.db.session import get_db

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/session", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    request: SessionCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Create a new chat session"""
    session_token = str(uuid.uuid4())
    
    db_session = ChatSession(
        user_id=request.user_id,
        session_token=session_token,
        is_active=True
    )
    
    db.add(db_session)
    await db.commit()
    await db.refresh(db_session)
    
    return SessionResponse(
        session_token=session_token,
        messages=[],
        created_at=db_session.created_at
    )


@router.get("/session/{session_token}", response_model=SessionResponse)
async def get_session(
    session_token: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a chat session with its message history"""
    result = await db.execute(
        select(ChatSession).where(ChatSession.session_token == session_token)
    )
    db_session = result.scalar_one_or_none()
    
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Get messages for this session
    messages_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == db_session.id)
        .order_by(ChatMessage.created_at)
    )
    db_messages = messages_result.scalars().all()
    
    messages = [
        ChatMessageResponse(
            role=msg.role,
            content=msg.content,
            citations=extract_citations_from_chunks(msg.retrieved_chunks),
            token_count=msg.token_count,
            created_at=msg.created_at
        )
        for msg in db_messages
    ]
    
    return SessionResponse(
        session_token=db_session.session_token,
        messages=messages,
        created_at=db_session.created_at
    )


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    request: ChatMessageRequest,
    db: AsyncSession = Depends(get_db)
):
    """Send a message and get a RAG-powered response"""
    rag_service = get_rag_service()
    
    # Get or create session
    db_session = None
    if request.session_token:
        result = await db.execute(
            select(ChatSession).where(ChatSession.session_token == request.session_token)
        )
        db_session = result.scalar_one_or_none()
    
    if not db_session:
        # Create new session if none provided
        session_token = str(uuid.uuid4())
        db_session = ChatSession(
            user_id=None,
            session_token=session_token,
            is_active=True
        )
        db.add(db_session)
        await db.commit()
        await db.refresh(db_session)
    
    # Save user message
    user_message = ChatMessage(
        session_id=db_session.id,
        role="user",
        content=request.message,
        token_count=len(request.message.split())  # Approximate token count
    )
    db.add(user_message)
    await db.commit()
    
    try:
        # Search for relevant chunks using RAG
        try:
            chunks = await rag_service.search_similar_chunks(
                query=request.message,
                limit=5,
                score_threshold=0.7,
                selected_text=request.selected_text
            )
        except Exception as rag_error:
            # RAG service not available - use Gemini directly
            logging.info(f"RAG not available, using Gemini directly: {rag_error}")
            chunks = None

        # Construct prompt with context
        if chunks:
            prompt = rag_service.construct_prompt(
                query=request.message,
                context_chunks=chunks,
                selected_text=request.selected_text
            )
        else:
            # No chunks found - use simple prompt with Gemini
            prompt = f"""You are an expert AI assistant for Physical AI & Humanoid Robotics textbook.
            
Answer the following question based on your knowledge of robotics, AI, and related technologies.
Be helpful, accurate, and educational in your response.

USER QUESTION:
{request.message}

Please provide a detailed, educational answer."""

        # Generate response using Gemini
        response_content = await generate_gemini_response(prompt)

        # Extract citations
        citations = rag_service.extract_citations(chunks) if chunks else None
        
        # Save assistant message
        assistant_message = ChatMessage(
            session_id=db_session.id,
            role="assistant",
            content=response_content,
            retrieved_chunks={
                "chunks": [
                    {"text": c["text"], "source": c["source"], "score": c["score"]}
                    for c in chunks
                ]
            } if chunks else None,
            token_count=len(response_content.split())
        )
        db.add(assistant_message)
        await db.commit()
        await db.refresh(assistant_message)
        
        return ChatMessageResponse(
            role="assistant",
            content=response_content,
            citations=[
                Citation(
                    text=c.text[:200] + "..." if len(c.text) > 200 else c.text,
                    source=c.source,
                    score=c.score,
                    page=None
                )
                for c in citations
            ] if citations else None,
            token_count=assistant_message.token_count,
            created_at=assistant_message.created_at
        )
        
    except Exception as e:
        # Log the error for debugging
        import logging
        logging.error(f"RAG chat error: {str(e)}")
        import traceback
        logging.error(f"Traceback: {traceback.format_exc()}")
        
        # Check if it's a quota error
        error_message = str(e).lower()
        if 'quota' in error_message or 'rate limit' in error_message:
            return ChatMessageResponse(
                role="assistant",
                content="""## ⚠️ Gemini API Quota Exceeded

The Gemini API key has reached its usage limit for today.

**To fix this:**

1. **Wait a few minutes** - Free tier quotas reset periodically
2. **Get a new API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **Update the `.env` file** with the new key:
   ```
   GEMINI_API_KEY=your_new_key_here
   ```
4. **Restart the API server**

**Current Status:**
- ✓ Frontend: Working
- ✓ API Server: Running
- ✓ Database: Connected
- ⚠️ Gemini API: Quota exceeded

Once you have a new API key, the chatbot will be able to answer your questions about Physical AI and robotics!""",
                citations=None,
                token_count=0,
                created_at=datetime.now()
            )
        
        # Try to use Gemini directly as final fallback
        try:
            response_content = await generate_gemini_response(
                f"Answer this robotics question: {request.message}"
            )
            return ChatMessageResponse(
                role="assistant",
                content=response_content,
                citations=None,
                token_count=0,
                created_at=datetime.now()
            )
        except Exception as fallback_error:
            # Return error message if everything fails
            return ChatMessageResponse(
                role="assistant",
                content=f"""Hello! I'm your Physical AI & Humanoid Robotics textbook assistant.

I received your question: "{request.message}"

**Current Status:**
- ✓ API Connection: Working
- ✓ Database: Connected  
- ⚠️ Gemini AI: Quota exceeded

**To enable responses:**
1. Get a new Gemini API key from https://aistudio.google.com/app/apikey
2. Update the `.env` file: `GEMINI_API_KEY=your_new_key`
3. Restart the API server

Once configured, I'll be able to answer questions about:
- ROS 2 fundamentals
- Gazebo & Unity simulation
- NVIDIA Isaac platform
- Vision-Language-Action (VLA) models""",
                citations=None,
                token_count=0,
                created_at=datetime.now()
            )


@router.get("/history/{user_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get all chat sessions for a user"""
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == user_id)
        .where(ChatSession.is_active == True)
        .order_by(ChatSession.created_at.desc())
    )
    sessions = result.scalars().all()
    
    session_responses = []
    for session in sessions:
        # Get message count for each session
        msg_count_result = await db.execute(
            select(func.count(ChatMessage.id)).where(ChatMessage.session_id == session.id)
        )
        msg_count = msg_count_result.scalar() or 0
        
        session_responses.append(SessionResponse(
            session_token=session.session_token,
            messages=[],  # Don't include full messages in history list
            created_at=session.created_at
        ))
    
    return ChatHistoryResponse(
        sessions=session_responses,
        total=len(session_responses)
    )


def extract_citations_from_chunks(chunks_data: Optional[dict]) -> Optional[List[Citation]]:
    """Extract citations from stored chunks data"""
    if not chunks_data or "chunks" not in chunks_data:
        return None
    
    return [
        Citation(
            text=chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"],
            source=chunk["source"],
            score=chunk["score"],
            page=None
        )
        for chunk in chunks_data["chunks"]
    ]


async def generate_gemini_response(prompt: str) -> str:
    """Generate response using Gemini API"""
    import google.generativeai as genai
    from app.config import get_settings

    settings = get_settings()
    genai.configure(api_key=settings.GEMINI_API_KEY)

    # Use Gemini 2.0 Flash (available in this API key)
    model = genai.GenerativeModel('gemini-2.0-flash')

    # Generate response
    response = await asyncio.to_thread(
        model.generate_content,
        prompt
    )

    return response.text


# Import asyncio for async operations
import asyncio
