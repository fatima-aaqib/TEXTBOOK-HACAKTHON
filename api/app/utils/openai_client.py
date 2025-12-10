"""
OpenAI API client configuration
T013: Configure OpenAI API client for RAG chatbot
"""
from openai import AsyncOpenAI
from functools import lru_cache
from app.config import get_settings


@lru_cache()
def get_openai_client() -> AsyncOpenAI:
    """
    Get cached OpenAI async client instance

    Returns:
        AsyncOpenAI: Configured OpenAI client for async operations
    """
    settings = get_settings()
    return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_embeddings(text: str, model: str = "text-embedding-3-small") -> list[float]:
    """
    Generate embeddings for text using OpenAI API

    Args:
        text: Text to embed
        model: Embedding model to use (default: text-embedding-3-small)

    Returns:
        List of embedding values (1536 dimensions for text-embedding-3-small)
    """
    client = get_openai_client()
    response = await client.embeddings.create(
        model=model,
        input=text
    )
    return response.data[0].embedding


async def chat_completion(
    messages: list[dict],
    model: str = "gpt-3.5-turbo",
    temperature: float = 0.7,
    max_tokens: int = 500,
    stream: bool = False
):
    """
    Generate chat completion using OpenAI API

    Args:
        messages: List of message dicts with 'role' and 'content'
        model: Model to use (gpt-3.5-turbo or gpt-4)
        temperature: Randomness (0-1, lower = more focused)
        max_tokens: Maximum response length
        stream: Whether to stream the response

    Returns:
        Chat completion response (streaming or complete)
    """
    client = get_openai_client()
    response = await client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
        stream=stream
    )
    return response
