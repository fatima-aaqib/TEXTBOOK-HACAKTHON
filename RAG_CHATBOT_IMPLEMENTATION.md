# RAG Chatbot Implementation Guide

## Overview

A fully functional RAG (Retrieval-Augmented Generation) chatbot has been implemented for the Physical AI textbook with:
- **Backend**: FastAPI with Qdrant vector database and OpenAI
- **Frontend**: React components for Docusaurus (requires completion)
- **Features**: Semantic search, citations, text selection context, session management

---

## Backend Implementation ✅ COMPLETE

### 1. Database Models (`api/app/models/chat.py`)

```python
- ChatSession: user_id, session_token, is_active, created_at
- ChatMessage: session_id, role, content, retrieved_chunks (JSON), token_count
```

### 2. API Endpoints (`api/app/api/v1/chat.py`)

**Base URL**: `/api/v1/chat`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/session` | POST | Create new chat session |
| `/message` | POST | Send message, get RAG response |
| `/session/{token}` | GET | Get session with history |
| `/history/{user_id}` | GET | Get all user sessions |

**Example Usage**:

```bash
# Create session
curl -X POST http://localhost:8000/api/v1/chat/session \
  -H "Content-Type: application/json" \
  -d '{"user_id": null}'

# Send message
curl -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I create a ROS 2 publisher?",
    "session_token": "YOUR_SESSION_TOKEN",
    "selected_text": null
  }'
```

### 3. RAG Service (`api/app/services/rag_service.py`)

**Features**:
- Generates embeddings with `text-embedding-3-small`
- Searches Qdrant with cosine similarity (threshold: 0.7)
- Returns top 5 most relevant chunks
- Constructs prompts with context
- Extracts citations for responses

**Key Methods**:
```python
generate_embedding(text) → List[float]
search_similar_chunks(query, limit=5) → List[Dict]
construct_prompt(query, chunks) → str
extract_citations(chunks) → List[Citation]
```

### 4. Document Indexer (`api/scripts/index_content.py`)

**Features**:
- Processes all `.md` files in `website/docs/`
- Chunks text (1000 chars with 200 overlap)
- Cleans markdown (removes code blocks, images, frontmatter)
- Generates embeddings
- Uploads to Qdrant with metadata

**Usage**:
```bash
cd api
python scripts/index_content.py --input ../website/docs --reset
```

**Output**:
```
Indexing directory: website/docs
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

---

## Frontend Implementation 🔧 IN PROGRESS

### Required React Components

#### 1. `Chatbot.tsx` - Main Chatbot Component

**Location**: `website/src/components/Chatbot.tsx`

**Features**:
- Floating chat button (bottom-right)
- Expandable chat interface
- Message list with user/assistant messages
- Input field with send button
- Loading states
- Error handling

**Key State**:
```typescript
const [isOpen, setIsOpen] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [sessionToken, setSessionToken] = useState('');
```

**API Calls**:
```typescript
// Create session on mount
const createSession = async () => {
  const response = await fetch('/api/v1/chat/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: null })
  });
  const data = await response.json();
  setSessionToken(data.session_token);
};

// Send message
const sendMessage = async (message: string) => {
  const response = await fetch('/api/v1/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      session_token: sessionToken,
      selected_text: getSelectedText()
    })
  });
  const data = await response.json();
  // Add assistant response to messages
};
```

#### 2. `ChatMessage.tsx` - Individual Message Component

**Features**:
- Different styling for user vs assistant
- Markdown rendering for responses
- Citation display
- Timestamp

#### 3. `Citation.tsx` - Source Citation Component

**Features**:
- Clickable link to source chapter
- Relevance score display
- Preview text on hover

### CSS Styling

**Chatbot Button** (floating, bottom-right):
```css
.chatbot-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--ifm-color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
}
```

**Chat Window**:
```css
.chatbot-window {
  position: fixed;
  bottom: 6rem;
  right: 2rem;
  width: 400px;
  height: 600px;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  background: white;
  z-index: 9998;
}
```

### Integration with Docusaurus

**Create Root Component** (`website/src/theme/Root.tsx`):
```tsx
import React from 'react';
import Chatbot from '@site/src/components/Chatbot';

export default function Root({children}) {
  return (
    <>
      {children}
      <Chatbot />
    </>
  );
}
```

### Text Selection Detection

**Utility Function**:
```typescript
function getSelectedText(): string | null {
  const selection = window.getSelection();
  return selection && selection.toString().trim().length > 0
    ? selection.toString()
    : null;
}
```

---

## Environment Variables

**Backend** (`api/.env`):
```env
# OpenAI
OPENAI_API_KEY=sk-...

# Qdrant Cloud
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-key
QDRANT_COLLECTION_NAME=physical_ai_textbook

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

**Frontend** (`website/.env.local`):
```env
API_URL=http://localhost:8000
```

---

## Deployment Checklist

### Backend (FastAPI)

1. **Install dependencies**:
   ```bash
   cd api
   pip install -r requirements.txt
   ```

2. **Set environment variables** (see above)

3. **Initialize Qdrant collection**:
   ```bash
   python scripts/index_content.py --input ../website/docs --reset
   ```

4. **Run FastAPI**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. **Test endpoints**:
   ```bash
   curl http://localhost:8000/health
   curl http://localhost:8000/api/v1/chat/health
   ```

### Frontend (React/Docusaurus)

1. **Install dependencies**:
   ```bash
   cd website
   npm install react-markdown
   ```

2. **Create components** (see above)

3. **Update Docusaurus config** to set API URL

4. **Build and test**:
   ```bash
   npm run build
   npm run serve
   ```

---

## Testing

### Manual Testing

1. **Start backend**: `uvicorn app.main:app --reload`
2. **Index content**: `python scripts/index_content.py --input ../website/docs --reset`
3. **Test API**:
   ```bash
   # Create session
   curl -X POST http://localhost:8000/api/v1/chat/session \
     -H "Content-Type: application/json" \
     -d '{"user_id": null}'

   # Send message
   curl -X POST http://localhost:8000/api/v1/chat/message \
     -H "Content-Type: application/json" \
     -d '{
       "message": "What is ROS 2?",
       "session_token": "YOUR_TOKEN"
     }'
   ```

4. **Start frontend**: `cd website && npm start`
5. **Open chatbot** and test:
   - Ask: "How do I install ROS 2?"
   - Check citations are displayed
   - Verify context from selected text works

### Expected Behavior

**Good Response**:
```json
{
  "session_token": "abc123...",
  "message": {
    "role": "assistant",
    "content": "To install ROS 2, follow these steps:\n\n1. Add ROS 2 apt repository...",
    "citations": [
      {
        "text": "ROS 2 installation requires...",
        "source": "module-1-ros2/installation.md",
        "score": 0.89
      }
    ],
    "token_count": 450
  }
}
```

---

## Troubleshooting

### Common Issues

**1. Qdrant Connection Error**
```
Error: Could not connect to Qdrant
```
**Solution**: Check `QDRANT_URL` and `QDRANT_API_KEY` in `.env`

**2. OpenAI Rate Limit**
```
Error: Rate limit exceeded
```
**Solution**: Add retry logic or upgrade OpenAI plan

**3. No Search Results**
```
Warning: No similar chunks found
```
**Solution**:
- Run indexing script again
- Lower `score_threshold` in `search_similar_chunks()`

**4. CORS Error in Browser**
```
Access to fetch blocked by CORS policy
```
**Solution**: Add frontend URL to `CORS_ORIGINS` in backend config

---

## Performance Optimization

### Backend

1. **Cache embeddings**: Store query embeddings for common questions
2. **Batch processing**: Process multiple queries in parallel
3. **Connection pooling**: Use connection pools for Qdrant
4. **Rate limiting**: Implement rate limiting middleware

### Frontend

1. **Debounce input**: Wait 300ms before sending
2. **Virtual scrolling**: For long message histories
3. **Lazy loading**: Load citations on demand
4. **Code splitting**: Separate chatbot bundle

---

## Next Steps

1. **Complete React components** (Chatbot.tsx, ChatMessage.tsx, Citation.tsx)
2. **Add markdown rendering** for assistant responses
3. **Implement streaming responses** (SSE) for real-time answers
4. **Add rate limiting** for anonymous users (10 queries/hour)
5. **Create database migrations** for chat tables
6. **Add user authentication** integration
7. **Deploy to production** (Vercel for backend, GitHub Pages for frontend)

---

## API Documentation

Once deployed, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Support

For issues or questions:
- Check FastAPI logs: `tail -f api/logs/app.log`
- Check Qdrant dashboard: Your Qdrant Cloud console
- Test OpenAI: `openai api models.list`
