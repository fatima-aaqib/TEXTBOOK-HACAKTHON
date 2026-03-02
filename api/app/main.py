"""
FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.middleware.error_handler import error_handler_middleware
from app.api.v1.chat import router as chat_router


# Create FastAPI app
app = FastAPI(
    title="Physical AI Textbook API",
    description="Backend API for Physical AI & Humanoid Robotics interactive textbook",
    version="1.0.0"
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

# Include routers
app.include_router(chat_router, prefix="/api/v1")


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
            "api": "operational"
        }
    }
