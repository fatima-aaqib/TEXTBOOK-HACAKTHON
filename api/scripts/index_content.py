"""
Content indexing script for RAG chatbot
T061: Index markdown files into Qdrant with embeddings
"""
import asyncio
import os
import sys
from pathlib import Path
from typing import List, Dict, Any
import re

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

import google.generativeai as genai
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class ContentIndexer:
    """Index textbook content into Qdrant vector database"""

    def __init__(self, docs_dir: str):
        self.docs_dir = Path(docs_dir)
        self.genai = genai

        # Use local path if URL not provided
        qdrant_url = os.getenv("QDRANT_URL")
        qdrant_path = os.getenv("QDRANT_PATH")

        if qdrant_url:
            self.qdrant_client = QdrantClient(
                url=qdrant_url,
                api_key=os.getenv("QDRANT_API_KEY")
            )
        elif qdrant_path:
            self.qdrant_client = QdrantClient(path=qdrant_path)
        else:
            # Default to in-memory
            self.qdrant_client = QdrantClient(location=":memory:")

        self.collection_name = os.getenv("QDRANT_COLLECTION_NAME", "physical_ai_textbook")
        self.embedding_model = "models/embedding-001"
        self.chunk_size = 1000  # characters per chunk
        self.chunk_overlap = 200  # overlap between chunks

    async def initialize_collection(self):
        """Create or recreate Qdrant collection"""
        print(f"Initializing collection: {self.collection_name}")

        # Delete existing collection if it exists
        try:
            self.qdrant_client.delete_collection(self.collection_name)
            print("Deleted existing collection")
        except Exception:
            pass

        # Create new collection
        self.qdrant_client.create_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(
                size=768,  # embedding-001 dimension
                distance=Distance.COSINE
            )
        )
        print("Created new collection")

    def chunk_text(self, text: str, metadata: Dict[str, str]) -> List[Dict[str, Any]]:
        """
        Split text into overlapping chunks

        Args:
            text: Text to chunk
            metadata: Metadata for the source

        Returns:
            List of chunk dicts with text and metadata
        """
        chunks = []
        text_length = len(text)

        for start in range(0, text_length, self.chunk_size - self.chunk_overlap):
            end = min(start + self.chunk_size, text_length)
            chunk_text = text[start:end].strip()

            if len(chunk_text) < 100:  # Skip very short chunks
                continue

            chunks.append({
                "text": chunk_text,
                "metadata": {
                    **metadata,
                    "chunk_index": len(chunks),
                    "start_char": start,
                    "end_char": end
                }
            })

        return chunks

    def extract_metadata(self, file_path: Path) -> Dict[str, str]:
        """
        Extract metadata from markdown file

        Args:
            file_path: Path to markdown file

        Returns:
            Dict with module, chapter, source info
        """
        rel_path = file_path.relative_to(self.docs_dir)
        parts = rel_path.parts

        module = parts[0] if len(parts) > 0 else "unknown"
        chapter = file_path.stem
        source = str(rel_path)

        return {
            "module": module,
            "chapter": chapter,
            "source": source,
            "file_path": str(file_path)
        }

    def clean_markdown(self, text: str) -> str:
        """
        Clean markdown text for better indexing

        Args:
            text: Raw markdown text

        Returns:
            Cleaned text
        """
        # Remove frontmatter
        text = re.sub(r'^---[\s\S]*?---\n', '', text)

        # Remove code blocks (but keep inline code)
        text = re.sub(r'```[\s\S]*?```', ' [code block] ', text)

        # Remove images
        text = re.sub(r'!\[.*?\]\(.*?\)', '', text)

        # Convert markdown links to plain text
        text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)

        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)

        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)

        return text.strip()

    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text using Gemini

        Args:
            text: Text to embed

        Returns:
            Embedding vector
        """
        import time
        max_retries = 3
        for attempt in range(max_retries):
            try:
                result = self.genai.embed_content(
                    model=self.embedding_model,
                    content=text,
                    task_type="retrieval_document"
                )
                return result['embedding']
            except Exception as e:
                if "429" in str(e) or "quota" in str(e).lower():
                    # Rate limit exceeded, wait and retry
                    wait_time = 40 * (attempt + 1)
                    print(f"    Rate limit hit, waiting {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    raise
        raise Exception("Failed to generate embedding after multiple retries")

    async def index_file(self, file_path: Path) -> int:
        """
        Index a single markdown file

        Args:
            file_path: Path to markdown file

        Returns:
            Number of chunks indexed
        """
        print(f"Indexing: {file_path.relative_to(self.docs_dir)}")

        try:
            # Read file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Clean markdown
            cleaned_content = self.clean_markdown(content)

            if len(cleaned_content) < 100:
                print(f"  Skipped (too short): {file_path.name}")
                return 0

            # Extract metadata
            metadata = self.extract_metadata(file_path)

            # Chunk text
            chunks = self.chunk_text(cleaned_content, metadata)

            if not chunks:
                print(f"  No chunks created: {file_path.name}")
                return 0

            # Generate embeddings and create points
            points = []
            for i, chunk in enumerate(chunks):
                embedding = await self.generate_embedding(chunk["text"])

                point = PointStruct(
                    id=hash(f"{file_path}_{i}") % (2**63 - 1),  # Generate unique ID
                    vector=embedding,
                    payload={
                        "text": chunk["text"],
                        "source": chunk["metadata"]["source"],
                        "module": chunk["metadata"]["module"],
                        "chapter": chunk["metadata"]["chapter"],
                        "chunk_index": chunk["metadata"]["chunk_index"]
                    }
                )
                points.append(point)

            # Upload to Qdrant
            self.qdrant_client.upsert(
                collection_name=self.collection_name,
                points=points
            )

            print(f"  Indexed {len(chunks)} chunks")
            return len(chunks)

        except Exception as e:
            print(f"  Error indexing {file_path.name}: {str(e)}")
            return 0

    async def index_directory(self) -> Dict[str, int]:
        """
        Index all markdown files in directory

        Returns:
            Dict with indexing statistics
        """
        print(f"\nIndexing directory: {self.docs_dir}")
        print("-" * 60)

        md_files = list(self.docs_dir.rglob("*.md"))
        print(f"Found {len(md_files)} markdown files\n")

        total_chunks = 0
        total_files = 0

        for file_path in md_files:
            chunks = await self.index_file(file_path)
            if chunks > 0:
                total_chunks += chunks
                total_files += 1

        print("\n" + "=" * 60)
        print(f"Indexing complete!")
        print(f"Files indexed: {total_files}/{len(md_files)}")
        print(f"Total chunks: {total_chunks}")
        print("=" * 60)

        return {
            "total_files": len(md_files),
            "indexed_files": total_files,
            "total_chunks": total_chunks
        }


async def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Index textbook content for RAG")
    parser.add_argument(
        "--input",
        default="website/docs",
        help="Input directory containing markdown files"
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Reset collection before indexing"
    )

    args = parser.parse_args()

    # Validate input directory
    docs_dir = Path(args.input)
    if not docs_dir.exists():
        print(f"Error: Directory not found: {docs_dir}")
        sys.exit(1)

    # Create indexer
    indexer = ContentIndexer(str(docs_dir))

    # Initialize collection if reset flag is set
    if args.reset:
        await indexer.initialize_collection()

    # Index content
    stats = await indexer.index_directory()

    print(f"\nIndexing statistics:")
    print(f"  Files: {stats['indexed_files']}/{stats['total_files']}")
    print(f"  Chunks: {stats['total_chunks']}")


if __name__ == "__main__":
    asyncio.run(main())
