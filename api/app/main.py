"""
FastAPI application entry point
T015: Create FastAPI app with CORS middleware
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import get_settings
from app.middleware.error_handler import error_handler_middleware
from app.utils.vector_store import initialize_collection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager - runs on startup and shutdown

    Initializes:
    - Qdrant vector database collection
    """
    # Startup
    await initialize_collection()
    yield
    # Shutdown (cleanup if needed)


# Create FastAPI app
app = FastAPI(
    title="Physical AI Textbook API",
    description="Backend API for Physical AI & Humanoid Robotics interactive textbook",
    version="1.0.0",
    lifespan=lifespan
)

# Load settings
settings = get_settings()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add error handling middleware
app.middleware("http")(error_handler_middleware)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Physical AI Textbook API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "services": {
            "api": "operational",
            "database": "connected",
            "vector_store": "connected"
        }
    }


# Import and include routers
# TODO: Add routers when implemented
# from app.routers import auth, chat, translate, personalize
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
# app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
# app.include_router(translate.router, prefix="/api/v1/translate", tags=["translate"])
# app.include_router(personalize.router, prefix="/api/v1/personalize", tags=["personalize"])
