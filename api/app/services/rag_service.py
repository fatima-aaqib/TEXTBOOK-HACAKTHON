"""
RAG Service for semantic search and context retrieval
T062: RAGService implementation with Qdrant and Gemini
"""
from typing import List, Dict, Any, Optional
from app.utils.gemini_client import get_gemini_client, get_embedding_model
from app.utils.vector_store import get_qdrant_client
from app.config import get_settings
from qdrant_client.models import Filter, FieldCondition, MatchValue


settings = get_settings()


class RAGService:
    """Service for RAG operations: embeddings, search, prompt construction"""

    def __init__(self):
        self.genai = get_gemini_client()
        self.qdrant_client = get_qdrant_client()
        self.collection_name = settings.QDRANT_COLLECTION_NAME
        self.embedding_model = get_embedding_model()
        self.embedding_dimension = 3072  # Gemini embedding-001 dimension

    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for text using Gemini

        Args:
            text: Input text to embed

        Returns:
            List of floats representing the embedding vector
        """
        result = self.genai.embed_content(
            model=self.embedding_model,
            content=text,
            task_type="retrieval_query"
        )
        return result['embedding']

    async def search_similar_chunks(
        self,
        query: str,
        limit: int = 5,
        score_threshold: float = 0.7,
        selected_text: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar chunks in vector database

        Args:
            query: User's question
            limit: Maximum number of results
            score_threshold: Minimum similarity score (0-1)
            selected_text: Optional context from user selection

        Returns:
            List of dicts with keys: text, source, score, metadata
        """
        # Enhance query with selected text if provided
        search_query = query
        if selected_text:
            search_query = f"Context: {selected_text}\n\nQuestion: {query}"

        # Generate embedding for query
        query_embedding = await self.generate_embedding(search_query)

        # Search in Qdrant
        search_results = self.qdrant_client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            limit=limit,
            score_threshold=score_threshold,
            with_payload=True
        )

        # Format results
        chunks = []
        for result in search_results:
            chunks.append({
                "text": result.payload.get("text", ""),
                "source": result.payload.get("source", ""),
                "score": result.score,
                "metadata": {
                    "module": result.payload.get("module", ""),
                    "chapter": result.payload.get("chapter", ""),
                    "section": result.payload.get("section", "")
                }
            })

        return chunks

    def construct_prompt(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
        selected_text: Optional[str] = None
    ) -> str:
        """
        Construct prompt for OpenAI with RAG context

        Args:
            query: User's question
            context_chunks: Retrieved similar chunks
            selected_text: Optional user-selected text

        Returns:
            Formatted prompt string
        """
        # System message
        system = (
            "You are an expert AI assistant for the Physical AI & Humanoid Robotics textbook. "
            "Your role is to answer questions based ONLY on the provided textbook content. "
            "Always cite the source chapter when answering. "
            "If the answer is not in the provided context, say so clearly."
        )

        # Build context from chunks
        context_parts = []
        for i, chunk in enumerate(context_chunks, 1):
            source = chunk['source']
            text = chunk['text']
            context_parts.append(f"[Source {i}: {source}]\n{text}\n")

        context = "\n".join(context_parts)

        # Add selected text if provided
        if selected_text:
            context = f"User selected text:\n{selected_text}\n\n{context}"

        # Construct full prompt
        prompt = f"""{system}

CONTEXT FROM TEXTBOOK:
{context}

USER QUESTION:
{query}

Please provide a detailed answer based on the context above, and cite the relevant sources."""

        return prompt

    def extract_citations(self, context_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Extract citation information from context chunks

        Args:
            context_chunks: Retrieved chunks with metadata

        Returns:
            List of citation dicts for API response
        """
        citations = []
        for chunk in context_chunks:
            citations.append({
                "text": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"],
                "source": chunk["source"],
                "score": round(chunk["score"], 3),
                "page": chunk.get("metadata", {}).get("section")
            })
        return citations


# Singleton instance
_rag_service = None


def get_rag_service() -> RAGService:
    """Get or create RAG service instance"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
