"""
Qdrant Cloud vector database client
T012: Setup Qdrant Cloud client for RAG chatbot
"""
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from functools import lru_cache
from app.config import get_settings
from typing import List, Dict, Any


COLLECTION_NAME = "textbook_content"
VECTOR_SIZE = 1536  # text-embedding-3-small dimensions


@lru_cache()
def get_qdrant_client() -> AsyncQdrantClient:
    """
    Get cached Qdrant async client instance

    Returns:
        AsyncQdrantClient: Configured Qdrant client
    """
    settings = get_settings()
    return AsyncQdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
    )


async def initialize_collection():
    """
    Initialize Qdrant collection for textbook content
    Creates collection if it doesn't exist
    """
    client = get_qdrant_client()

    # Check if collection exists
    collections = await client.get_collections()
    collection_names = [c.name for c in collections.collections]

    if COLLECTION_NAME not in collection_names:
        await client.create_collection(
            collection_name=COLLECTION_NAME,
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
        collection_name=COLLECTION_NAME,
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

    results = await client.search(
        collection_name=COLLECTION_NAME,
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
