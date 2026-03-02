# RAG Chatbot Setup Guide

## Overview

This guide explains how to set up and run the RAG (Retrieval-Augmented Generation) chatbot for the Physical AI textbook website using Google Gemini API.

## Features

- **Gemini-Powered RAG**: Uses Google Gemini for embeddings and text generation
- **Qdrant Vector Database**: Semantic search across all 24 textbook chapters
- **Session Management**: Persistent chat sessions with history
- **User Authentication**: Optional login for chat history persistence
- **Citations**: Shows source chapters for each answer
- **Text Selection**: Ask questions about selected text on the page
- **Mobile Responsive**: Works on all device sizes
- **Markdown Support**: Rich text formatting in responses

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Google Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Quick Start

### 1. Install Backend Dependencies

```bash
cd api

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

**Backend** (`api/.env`):

```env
# Database (optional - uses in-memory if not provided)
DATABASE_URL=postgresql://user:password@localhost:5432/physical_ai

# Qdrant (local storage)
QDRANT_PATH=./qdrant_storage
QDRANT_COLLECTION_NAME=physical_ai_textbook

# Google Gemini API (REQUIRED)
GEMINI_API_KEY=your_gemini_api_key_here

# CORS
CORS_ORIGINS=http://localhost:3000

# Environment
ENVIRONMENT=development
```

**Frontend** (`website/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Index Textbook Content

Index all textbook chapters into the vector database:

```bash
cd api

# Activate virtual environment if not already done
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Run indexing script
python scripts/index_content.py --input ../website/docs --reset
```

Expected output:
```
Initializing collection: physical_ai_textbook
Created new collection

Indexing directory: ../website/docs
------------------------------------------------------------
Found 24 markdown files

Indexing: module-1-ros2/01-introduction.md
  Indexed 5 chunks
...

============================================================
Indexing complete!
Files indexed: 24/24
Total chunks: 156
============================================================
```

### 4. Run the Backend

```bash
cd api

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### 5. Run the Frontend

Open a new terminal:

```bash
cd website

# Install dependencies if not already done
npm install

# Start development server
npm start
```

The website will be available at `http://localhost:3000`

## Using the Chatbot

### Basic Usage

1. Open any chapter page on the website
2. Click the chat bubble icon in the bottom-right corner
3. Type your question about the textbook content
4. Press Enter or click the send button
5. View the answer with citations to source chapters

### Advanced Features

**Text Selection**: 
- Select any text on the chapter page
- Ask a question about the selected text
- The chatbot will use the selected text as context

**User Authentication**:
- Click "Login" in the chat widget
- Chat history will be saved for authenticated users
- Access previous conversations from any page

**Citations**:
- Each answer shows source chapters
- Match percentage indicates relevance
- Click on citations to navigate to the source

## API Endpoints

### Chat API

**Base URL**: `http://localhost:8000/api/v1/chat`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/session` | POST | Create new chat session |
| `/session/{token}` | GET | Get session with message history |
| `/message` | POST | Send message, get RAG response |
| `/history/{user_id}` | GET | Get all sessions for a user |

### Example: Send a Message

```bash
curl -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is ROS 2?",
    "session_token": null,
    "selected_text": null
  }'
```

### Example Response

```json
{
  "role": "assistant",
  "content": "ROS 2 (Robot Operating System 2) is a flexible framework...",
  "citations": [
    {
      "text": "ROS 2 is a collection of tools...",
      "source": "module-1-ros2/01-introduction.md",
      "score": 0.89,
      "page": null
    }
  ],
  "token_count": 245,
  "created_at": "2025-02-20T10:30:00Z"
}
```

## Troubleshooting

### Gemini API Error

**Error**: `Error generating response: 403 Forbidden`

**Solution**: 
- Check that `GEMINI_API_KEY` is correct in `api/.env`
- Verify API key is active at [Google AI Studio](https://makersuite.google.com)
- Check API quota limits

### Qdrant Connection Error

**Error**: `Could not connect to Qdrant`

**Solution**:
- For local development, set `QDRANT_PATH=./qdrant_storage` in `.env`
- Ensure the directory is writable
- Or use `QDRANT_URL` and `QDRANT_API_KEY` for Qdrant Cloud

### No Search Results

**Error**: `Warning: No similar chunks found`

**Solution**:
- Run the indexing script: `python scripts/index_content.py --input ../website/docs --reset`
- Lower the `score_threshold` in `rag_service.py` (default: 0.7)
- Check that textbook markdown files exist in `website/docs`

### CORS Error in Browser

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
- Add frontend URL to `CORS_ORIGINS` in `api/.env`
- Example: `CORS_ORIGINS=http://localhost:3000,http://localhost:3001`
- Restart the backend after changing

### Chatbot Not Appearing

**Solution**:
- Check browser console for errors
- Verify `ChatbotProvider` is in `website/src/theme/Layout.js`
- Ensure `NEXT_PUBLIC_API_URL` is set correctly

## Production Deployment

### Backend (Railway/Render)

1. Set environment variables in platform dashboard
2. Deploy from `api/` directory
3. Run indexing script after deployment
4. Update `NEXT_PUBLIC_API_URL` in frontend

### Frontend (Vercel/Netlify)

1. Set `NEXT_PUBLIC_API_URL` to production API URL
2. Deploy from `website/` directory
3. Build command: `npm run build`
4. Output directory: `build`

### Qdrant Cloud

For production, use [Qdrant Cloud](https://cloud.qdrant.io):

```env
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-api-key
QDRANT_COLLECTION_NAME=physical_ai_textbook
```

## Performance Optimization

### Indexing Optimization

- Adjust `chunk_size` in `index_content.py` (default: 1000 chars)
- Modify `chunk_overlap` for better context (default: 200 chars)
- Re-index after content updates

### Query Optimization

- Adjust `score_threshold` in `rag_service.py` (default: 0.7)
- Modify `limit` for number of results (default: 5)
- Cache common queries

## Development Tips

### Testing the API

Use the interactive API docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Debugging RAG

Add logging to `rag_service.py`:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Monitoring

Check Qdrant storage:
```bash
ls -la api/qdrant_storage/
```

## Support

For issues or questions:
- Check API logs: Terminal where backend is running
- Check browser console: Frontend errors
- Review [RAG_CHATBOT_IMPLEMENTATION.md](../RAG_CHATBOT_IMPLEMENTATION.md)

---

Built with Google Gemini API & Qdrant 🚀
