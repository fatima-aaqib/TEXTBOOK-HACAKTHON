"""
Test script for RAG Chatbot API
Run this after setup to verify everything is working
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.config import get_settings
from app.services.rag_service import get_rag_service


async def test_gemini_connection():
    """Test Gemini API connection"""
    print("Testing Gemini API connection...")
    try:
        settings = get_settings()
        if not settings.GEMINI_API_KEY:
            print("❌ GEMINI_API_KEY not configured")
            return False
        
        # Mask API key for display
        key_display = settings.GEMINI_API_KEY[:10] + "..." + settings.GEMINI_API_KEY[-5:]
        print(f"✓ GEMINI_API_KEY found: {key_display}")
        
        # Test embedding generation
        rag_service = get_rag_service()
        test_text = "This is a test sentence for embedding."
        embedding = await rag_service.generate_embedding(test_text)
        
        if len(embedding) == 768:
            print(f"✓ Gemini embedding generated successfully (dimension: {len(embedding)})")
            return True
        else:
            print(f"❌ Unexpected embedding dimension: {len(embedding)} (expected 768)")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Gemini API: {str(e)}")
        return False


async def test_qdrant_connection():
    """Test Qdrant vector database connection"""
    print("\nTesting Qdrant connection...")
    try:
        settings = get_settings()
        
        if settings.QDRANT_URL:
            print(f"✓ Using Qdrant Cloud: {settings.QDRANT_URL[:30]}...")
        elif settings.QDRANT_PATH:
            print(f"✓ Using local Qdrant storage: {settings.QDRANT_PATH}")
        else:
            print("✓ Using in-memory Qdrant storage")
        
        rag_service = get_rag_service()
        
        # Test search (will return empty if collection doesn't exist)
        chunks = await rag_service.search_similar_chunks(
            query="test query",
            limit=1,
            score_threshold=0.7
        )
        
        print(f"✓ Qdrant search working (found {len(chunks)} chunks)")
        return True
        
    except Exception as e:
        print(f"❌ Error testing Qdrant: {str(e)}")
        return False


async def test_content_indexed():
    """Test if content has been indexed"""
    print("\nChecking indexed content...")
    try:
        rag_service = get_rag_service()
        
        # Search for common textbook terms
        test_queries = [
            "ROS 2",
            "What is a robot?",
            "simulation",
        ]
        
        total_chunks = 0
        for query in test_queries:
            chunks = await rag_service.search_similar_chunks(
                query=query,
                limit=1,
                score_threshold=0.0  # Lower threshold to get any results
            )
            total_chunks += len(chunks)
        
        if total_chunks > 0:
            print(f"✓ Content appears to be indexed (found {total_chunks} chunks across test queries)")
            return True
        else:
            print("⚠ No content found. Run the indexing script:")
            print("  python scripts/index_content.py --input ../website/docs --reset")
            return False
            
    except Exception as e:
        print(f"❌ Error checking indexed content: {str(e)}")
        return False


async def main():
    """Run all tests"""
    print("=" * 60)
    print("RAG Chatbot API Test Suite")
    print("=" * 60)
    print()
    
    results = []
    
    # Test 1: Gemini API
    results.append(await test_gemini_connection())
    
    # Test 2: Qdrant
    results.append(await test_qdrant_connection())
    
    # Test 3: Content indexed
    results.append(await test_content_indexed())
    
    print()
    print("=" * 60)
    print(f"Tests completed: {sum(results)}/{len(results)} passed")
    print("=" * 60)
    
    if all(results):
        print("\n✅ All tests passed! The RAG chatbot is ready to use.")
        print("\nNext steps:")
        print("1. Start the API server: uvicorn app.main:app --reload --port 8000")
        print("2. Start the frontend: cd website && npm start")
        print("3. Open http://localhost:3000 and click the chat widget")
        return 0
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
        print("\nTroubleshooting:")
        print("- Make sure api/.env exists with correct GEMINI_API_KEY")
        print("- Run the indexing script: python scripts/index_content.py --input ../website/docs --reset")
        print("- Check Qdrant storage directory exists and is writable")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
