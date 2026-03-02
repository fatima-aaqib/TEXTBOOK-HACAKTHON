# Physical AI Textbook - Backend API

FastAPI backend for the Physical AI & Humanoid Robotics interactive textbook with RAG-powered chatbot.

## Features

✅ **RAG Chatbot**: Semantic search with Qdrant + OpenAI embeddings
✅ **Chat Sessions**: Persistent conversation history
✅ **Source Citations**: Automatic chapter references
✅ **Text Selection Context**: Enhanced answers from user-selected text
✅ **OpenAPI Documentation**: Auto-generated API docs at `/docs`

## Quick Start

### 1. Install Dependencies

```bash
cd api
pip install -r requirements.txt
# or using poetry
poetry install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required variables:
- `OPENAI_API_KEY`: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- `QDRANT_URL`: Get from [Qdrant Cloud](https://cloud.qdrant.io)
- `QDRANT_API_KEY`: Your Qdrant API key
- `DATABASE_URL`: Postgres connection string (Neon recommended)

### 3. Index Content

Index the textbook chapters into Qdrant:

```bash
python scripts/index_content.py --input ../website/docs --reset
```

This will:
- Process all `.md` files in `website/docs/`
- Chunk text (1000 chars with 200 overlap)
- Generate embeddings with OpenAI
- Upload to Qdrant vector database

Expected output:
```
Indexing directory: ../website/docs
Found 3 markdown files

Indexing: module-1-ros2/introduction.md
  Indexed 5 chunks
Indexing: module-1-ros2/installation.md
  Indexed 7 chunks

====================================================
Indexing complete!
Files indexed: 2/3
Total chunks: 12
====================================================
```

### 4. Run Server

```bash
uvicorn app.main:app --reload --port 8000
```

Server will start at: `http://localhost:8000`

### 5. Test API

Visit the auto-generated documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Or test with curl:

```bash
# Health check
curl http://localhost:8000/health

# Create chat session
curl -X POST http://localhost:8000/api/v1/chat/session \
  -H "Content-Type: application/json" \
  -d '{"user_id": null}'

# Send message (replace YOUR_SESSION_TOKEN)
curl -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I install ROS 2?",
    "session_token": "YOUR_SESSION_TOKEN"
  }'
```

## API Endpoints

### Chat Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/chat/session` | POST | Create new chat session |
| `/api/v1/chat/message` | POST | Send message, get RAG response |
| `/api/v1/chat/session/{token}` | GET | Get session with history |
| `/api/v1/chat/history/{user_id}` | GET | Get all user sessions |
| `/api/v1/chat/health` | GET | Health check |

### Health Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Basic health check |
| `/health` | GET | Detailed health check |

## Project Structure

```
api/
├── app/
│   ├── api/v1/           # API routes
│   │   └── chat.py       # Chat endpoints
│   ├── models/           # Data models
│   │   ├── chat.py       # ChatSession, ChatMessage
│   │   └── schemas/      # Pydantic schemas
│   │       └── chat.py   # Request/response schemas
│   ├── services/         # Business logic
│   │   ├── rag_service.py    # RAG operations
│   │   └── chat_service.py   # Chat management
│   ├── utils/            # Utilities
│   │   ├── openai_client.py  # OpenAI client
│   │   ├── vector_store.py   # Qdrant client
│   │   └── security.py       # JWT utilities
│   ├── db/               # Database
│   │   ├── session.py    # DB connection
│   │   └── migrations/   # Alembic migrations
│   ├── middleware/       # Middleware
│   │   └── error_handler.py
│   ├── config.py         # Configuration
│   └── main.py           # FastAPI app
├── scripts/
│   └── index_content.py  # Content indexing script
├── pyproject.toml        # Poetry dependencies
├── requirements.txt      # Pip dependencies
└── .env.example          # Environment template
```

## Development

### Run Tests

```bash
pytest
```

### Code Formatting

```bash
# Format with Black
black app/

# Lint with Ruff
ruff check app/

# Type check with mypy
mypy app/
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add chat tables"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## RAG Architecture

### How It Works

1. **User asks question** → Sent to `/api/v1/chat/message`
2. **Generate embedding** → OpenAI `text-embedding-3-small`
3. **Semantic search** → Qdrant finds top 5 similar chunks (score > 0.7)
4. **Construct prompt** → Combine user query + retrieved context
5. **Generate answer** → OpenAI GPT-4 Turbo with context
6. **Extract citations** → Format source references
7. **Save to database** → Store message + citations + token count

### Key Components

**RAGService** (`app/services/rag_service.py`):
- `generate_embedding(text)` - Create embedding vector
- `search_similar_chunks(query, limit=5)` - Find relevant content
- `construct_prompt(query, chunks)` - Build RAG prompt
- `extract_citations(chunks)` - Format source references

**ChatService** (`app/services/chat_service.py`):
- `create_session()` - New chat session
- `send_message(token, message)` - Process query with RAG
- `get_history(token)` - Retrieve message history
- `get_user_sessions(user_id)` - All user sessions

### Configuration

**Environment Variables**:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Qdrant
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-key
QDRANT_COLLECTION_NAME=physical_ai_textbook

# Database
DATABASE_URL=postgresql://...

# CORS
CORS_ORIGINS=http://localhost:3000,https://your-site.github.io
```

**Tuning Parameters**:

In `app/services/rag_service.py`:
```python
embedding_model = "text-embedding-3-small"  # 1536 dimensions
embedding_dimension = 1536
search_limit = 5  # Top K chunks
score_threshold = 0.7  # Minimum similarity (0-1)
```

In `app/scripts/index_content.py`:
```python
chunk_size = 1000  # Characters per chunk
chunk_overlap = 200  # Overlap between chunks
```

## Deployment

### Using Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Configure environment variables in Vercel dashboard
4. Deploy: `vercel --prod`

### Using Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Run: `railway login`
3. Deploy: `railway up`
4. Set environment variables: `railway variables`

### Using Docker

```bash
docker build -t physical-ai-api .
docker run -p 8000:8000 --env-file .env physical-ai-api
```

## Troubleshooting

### Qdrant Connection Error

```
Error: Could not connect to Qdrant
```

**Solution**:
- Check `QDRANT_URL` and `QDRANT_API_KEY` in `.env`
- Verify cluster is running in Qdrant Cloud dashboard
- Test connection: `curl $QDRANT_URL/collections`

### No Search Results

```
Warning: No similar chunks found
```

**Solution**:
- Run indexing script again: `python scripts/index_content.py --input ../website/docs --reset`
- Lower `score_threshold` in `search_similar_chunks()` (try 0.5)
- Check if content was indexed: Visit Qdrant dashboard

### OpenAI Rate Limit

```
Error: Rate limit exceeded
```

**Solution**:
- Upgrade OpenAI plan or wait for rate limit reset
- Implement exponential backoff retry logic
- Cache common queries

### CORS Error

```
Access to fetch blocked by CORS policy
```

**Solution**:
- Add frontend URL to `CORS_ORIGINS` in `.env`
- Restart server after updating CORS settings

## Performance Tips

1. **Caching**: Cache embeddings for common queries
2. **Batching**: Process multiple queries in parallel
3. **Connection Pooling**: Use pools for Qdrant connections
4. **Rate Limiting**: Implement per-user limits
5. **Monitoring**: Track OpenAI token usage and costs

## Support

- **API Documentation**: http://localhost:8000/docs
- **Implementation Guide**: See `../RAG_CHATBOT_IMPLEMENTATION.md`
- **Issues**: Check FastAPI logs for error details

## License

Part of the Physical AI & Humanoid Robotics Textbook project.
