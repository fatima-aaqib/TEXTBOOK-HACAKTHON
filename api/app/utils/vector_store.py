"""
Qdrant Cloud vector database client
T012: Setup Qdrant Cloud client for RAG chatbot
"""
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from functools import lru_cache
from app.config import get_settings
from typing import List, Dict, Any


# Collection name from settings (defaults to "physical_ai_textbook")
def get_collection_name():
    """Get collection name from settings"""
    settings = get_settings()
    return settings.QDRANT_COLLECTION_NAME


VECTOR_SIZE = 3072  # Gemini embedding-001 dimensions


@lru_cache()
def get_qdrant_client():
    """
    Get cached Qdrant client instance (non-async for RAG service)

    Returns:
        QdrantClient: Configured Qdrant client
    """
    from qdrant_client import QdrantClient
    import os
    settings = get_settings()

    # Use local path if URL not provided
    if settings.QDRANT_URL:
        return QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
        )
    elif settings.QDRANT_PATH:
        # Use local file storage
        return QdrantClient(path=settings.QDRANT_PATH)
    else:
        # Use in-memory storage for development
        return QdrantClient(location=":memory:")


async def initialize_collection():
    """
    Initialize Qdrant collection for textbook content
    Creates collection if it doesn't exist
    """
    client = get_qdrant_client()
    collection_name = get_collection_name()

    # Check if collection exists
    collections = await client.get_collections()
    collection_names = [c.name for c in collections.collections]

    if collection_name not in collection_names:
        await client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE
            )
        )


async def upsert_vectors(
    points: List[Dict[str, Any]]
) -> None:
    """
    Insert or update vectors in Qdrant

    Args:
        points: List of dicts with 'id', 'vector', and 'payload' keys
    """
    client = get_qdrant_client()
    collection_name = get_collection_name()

    # Convert to PointStruct objects
    point_structs = [
        PointStruct(
            id=point["id"],
            vector=point["vector"],
            payload=point["payload"]
        )
        for point in points
    ]

    await client.upsert(
        collection_name=collection_name,
        points=point_structs
    )


async def search_similar(
    query_vector: List[float],
    limit: int = 5,
    score_threshold: float = 0.7
) -> List[Dict[str, Any]]:
    """
    Search for similar vectors in Qdrant

    Args:
        query_vector: Query embedding vector
        limit: Maximum number of results
        score_threshold: Minimum similarity score (0-1)

    Returns:
        List of search results with payload and score
    """
    client = get_qdrant_client()
    collection_name = get_collection_name()

    results = await client.search(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=limit,
        score_threshold=score_threshold
    )

    return [
        {
            "id": result.id,
            "score": result.score,
            "payload": result.payload
        }
        for result in results
    ]
