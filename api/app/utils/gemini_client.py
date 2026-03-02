"""
Gemini API client utility
"""
import google.generativeai as genai
from app.config import get_settings

settings = get_settings()

# Configure Gemini with API key from settings
genai.configure(api_key=settings.GEMINI_API_KEY)

def get_gemini_client():
    """Get configured Gemini client"""
    return genai


def get_embedding_model():
    """Get Gemini embedding model"""
    return 'models/text-embedding-004'


def get_chat_model():
    """Get Gemini chat model"""
    return genai.GenerativeModel('gemini-2.0-flash')
