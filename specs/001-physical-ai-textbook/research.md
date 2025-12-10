# Research: Physical AI & Humanoid Robotics Textbook

**Date**: 2025-12-10
**Feature**: 001-physical-ai-textbook
**Phase**: Phase 0 - Technology Research & Decision Making

## Overview

This document captures research findings and architectural decisions for the Physical AI textbook platform. The platform combines static content delivery with dynamic interactive features, requiring careful technology selection to balance performance, cost, and developer experience.

## Key Technology Decisions

### 1. Static Site Generator: Docusaurus 3.x

**Decision**: Use Docusaurus 3.x as the primary framework

**Rationale**:
- Purpose-built for documentation/educational content
- Excellent markdown support with MDX for interactive components
- Built-in features: search, versioning, i18n (for Urdu)
- React-based allows custom components (chatbot, quiz, auth UI)
- Optimized for performance (static generation + code splitting)
- Strong community in education/documentation space

**Alternatives Considered**:
- **Nextra**: Similar features but smaller ecosystem, less mature i18n
- **GitBook**: Proprietary, limited customization, not self-hostable
- **VuePress**: Smaller ecosystem than Docusaurus, fewer educational sites
- **Custom React app**: More flexibility but loses documentation-specific optimizations

**Implementation Notes**:
- Use Docusaurus plugin system for custom features
- Leverage @docusaurus/preset-classic for standard setup
- Custom theme swizzling for Tailwind CSS integration
- MDX for embedding interactive components in content

### 2. Backend Framework: FastAPI (Python 3.11+)

**Decision**: FastAPI for serverless API backend

**Rationale**:
- Excellent performance (ASGI, async/await support)
- Automatic OpenAPI documentation generation
- Type safety with Pydantic models
- Easy integration with ML/AI libraries (OpenAI, transformers)
- Serverless-friendly (works with Vercel, Railway, AWS Lambda)
- Python ecosystem matches RAG/ML requirements

**Alternatives Considered**:
- **Node.js + Express**: Good for full-stack TypeScript but weaker ML ecosystem
- **Django**: Too heavyweight for API-only backend, slower startup (poor for serverless)
- **Flask**: Simpler but lacks async support and automatic docs

**Implementation Notes**:
- Use async endpoints for I/O-bound operations (DB, OpenAI API)
- Pydantic for request/response validation
- SQLAlchemy with async support for Postgres
- Dependency injection for testability

### 3. Database: Neon Postgres (Serverless)

**Decision**: Neon Postgres for user data, quiz results, progress tracking

**Rationale**:
- True serverless Postgres (auto-scaling, pay-per-use)
- Free tier sufficient for MVP (1GB storage, 100 hours compute/month)
- Standard SQL with full Postgres features
- Branch-per-feature for testing (database branching)
- Low latency (<100ms cold start)

**Alternatives Considered**:
- **PlanetScale**: MySQL-based, good but prefer Postgres ecosystem
- **Supabase**: More features (auth, storage) but heavier, prefer custom auth
- **MongoDB Atlas**: NoSQL not ideal for relational quiz/user data
- **SQLite**: Not suitable for concurrent users

**Schema Design**:
```sql
users (id, email, password_hash, hw_level, sw_level, created_at)
quiz_attempts (id, user_id, quiz_id, answers, score, timestamp)
chat_sessions (id, user_id, messages, context, timestamp)
translations_cache (chapter_id, language, content, cached_at)
```

### 4. Vector Database: Qdrant Cloud

**Decision**: Qdrant Cloud for RAG embeddings storage

**Rationale**:
- Free tier: 1GB storage (~1M vectors)
- Fast similarity search (<50ms for 1M vectors)
- REST API (easy Python/JS integration)
- Supports filtering (by module, chapter metadata)
- Managed service (no ops burden)

**Alternatives Considered**:
- **Pinecone**: Good but more expensive, 1GB requires paid tier
- **Weaviate Cloud**: More complex setup, heavier footprint
- **Pgvector (in Neon)**: Simpler but slower search at scale, no filtering
- **Chroma**: Good for local dev but no managed option

**Embedding Strategy**:
- Use OpenAI text-embedding-3-small (cheaper, faster than ada-002)
- Chunk chapters into ~500-token segments with overlap
- Store metadata: module, chapter, section, difficulty level
- Re-index on content updates via CI/CD

### 5. Authentication: Better-Auth

**Decision**: Better-Auth for user authentication

**Rationale**:
- Modern, type-safe auth library
- Supports email/password + social providers
- JWT token generation
- Flexible (works with any backend)
- TypeScript-first (matches Docusaurus)

**Alternatives Considered**:
- **NextAuth**: Tied to Next.js, doesn't fit Docusaurus + FastAPI
- **Clerk**: Proprietary, $25/month beyond free tier
- **Auth0**: Complex setup, overkill for educational site
- **Custom JWT**: Reinventing the wheel, security risks

**Implementation**:
- Email/password for MVP
- Add OAuth (Google, GitHub) in Phase 2
- JWT stored in httpOnly cookies (XSS protection)
- Refresh token rotation for security

### 6. LLM for Chatbot: OpenAI GPT-3.5-turbo / GPT-4

**Decision**: OpenAI API with GPT-3.5-turbo for cost, GPT-4 for complex queries

**Rationale**:
- Best quality/cost ratio for educational Q&A
- Fast response times (~2-3s)
- Function calling for structured outputs
- Large context window (16k for 3.5-turbo)
- Simple API integration

**Alternatives Considered**:
- **Anthropic Claude**: Good quality but higher cost, no free tier
- **Open-source (Llama, Mistral)**: Requires hosting, slower, lower quality
- **Cohere**: Good but smaller community, less docs

**RAG Strategy**:
1. User asks question
2. Generate embedding for query (text-embedding-3-small)
3. Retrieve top-5 relevant chunks from Qdrant
4. Construct prompt: system + retrieved context + user question
5. Stream response with chapter references

**Cost Optimization**:
- Use GPT-3.5-turbo as default ($0.50 per 1M input tokens)
- Fall back to GPT-4 only for complex/ambiguous queries
- Cache common questions
- Rate limit: 10 queries/hour per free user, unlimited for authenticated

### 7. Translation: Google Cloud Translation API

**Decision**: Google Cloud Translation for Urdu translation

**Rationale**:
- Best Urdu support (neural machine translation)
- $20/month per 1M characters (generous free tier)
- Preserves HTML/markdown structure
- Fast (<2s for typical chapter)

**Alternatives Considered**:
- **Azure Translator**: Similar quality but more expensive
- **DeepL**: Better for European languages, weak Urdu support
- **AWS Translate**: Good but more complex setup

**Implementation**:
- Translate on-demand (client-side request)
- Cache translations in Postgres (translations_cache table)
- Preserve code blocks and technical terms (pre-processing)
- Option to mark terms as "do not translate" in markdown frontmatter

### 8. UI Components: Tailwind CSS + shadcn/ui

**Decision**: Tailwind CSS for styling, shadcn/ui for components

**Rationale**:
- Tailwind: utility-first, fast development, small bundle size
- shadcn/ui: copy-paste components (no dependency), Tailwind-based, accessible
- Works well with Docusaurus custom React components
- RTL support for Urdu (Tailwind built-in)

**Alternatives Considered**:
- **Material UI**: Heavier bundle, harder to customize
- **Chakra UI**: Good but adds dependency, slower
- **CSS Modules**: More boilerplate, less consistent

**Dark Mode**:
- Use Docusaurus built-in dark mode toggle
- Extend with Tailwind dark: variants
- Persist preference in localStorage

### 9. Hosting & Deployment

**Frontend Decision**: GitHub Pages

**Rationale**:
- Free unlimited bandwidth for public repos
- Automatic HTTPS
- Simple deployment (gh-pages branch or GitHub Actions)
- CDN-backed (fast global delivery)
- Custom domain support

**Backend Decision**: Vercel (primary) or Railway (fallback)

**Rationale**:
- **Vercel**:
  - Free tier: 100GB bandwidth, 100 hours serverless
  - Automatic HTTPS, CDN, zero-config
  - Excellent Python support (FastAPI)
  - Built-in preview deployments
- **Railway** (fallback):
  - Free $5 credit/month
  - Better for long-running processes
  - Simple env var management

**CI/CD**:
- GitHub Actions for both frontend and backend
- On push to main: run tests → deploy to production
- On PR: deploy preview environments
- Separate workflows for website and api

### 10. Testing Strategy

**Frontend Testing**:
- **Unit**: Jest + React Testing Library for components
- **Integration**: Test API calls with MSW (mock service worker)
- **E2E**: Playwright for critical user flows (signup, quiz, chatbot)

**Backend Testing**:
- **Unit**: pytest for services and utilities
- **Integration**: TestClient (FastAPI) with in-memory DB
- **Contract**: Validate OpenAPI schemas match implementation

**Coverage Goals**:
- Unit: >80% for business logic
- E2E: Cover all user stories (P1-P6)
- CI fails if coverage drops below threshold

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | Docusaurus | 3.x | Static site generation |
| **UI Library** | React | 18.x | Component rendering |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **Component Library** | shadcn/ui | Latest | Accessible UI components |
| **Backend Framework** | FastAPI | 0.115+ | REST API server |
| **Backend Language** | Python | 3.11+ | API business logic |
| **Database** | Neon Postgres | Latest | User/quiz/session data |
| **Vector DB** | Qdrant Cloud | Latest | RAG embeddings |
| **Authentication** | Better-Auth | Latest | JWT-based auth |
| **LLM** | OpenAI GPT-3.5/4 | Latest | Chatbot responses |
| **Embeddings** | text-embedding-3-small | Latest | Semantic search |
| **Translation** | Google Cloud Translation | V3 | Urdu translation |
| **Frontend Hosting** | GitHub Pages | N/A | Static site CDN |
| **Backend Hosting** | Vercel | N/A | Serverless functions |
| **CI/CD** | GitHub Actions | N/A | Automated deploy |
| **Testing (Frontend)** | Jest + Playwright | Latest | Unit + E2E |
| **Testing (Backend)** | pytest | 8.x | Unit + integration |

## Free Tier Limits & Monitoring

### GitHub Pages
- **Limit**: 1GB site size, 100GB bandwidth/month
- **Monitor**: Check site size in Actions, alert if >800MB
- **Mitigation**: Optimize images, lazy-load videos

### Neon Postgres
- **Limit**: 1GB storage, 100 compute hours/month
- **Monitor**: Dashboard metrics, alert at 80% usage
- **Mitigation**: Archive old quiz attempts, limit chat history

### Qdrant Cloud
- **Limit**: 1GB (~1M vectors)
- **Monitor**: Vector count, alert at 800k
- **Mitigation**: Delete old embeddings, optimize chunking

### OpenAI API
- **Limit**: Usage-based pricing, set monthly budget
- **Monitor**: Track token usage in DB, alert at threshold
- **Mitigation**: Cache responses, rate limit users, use GPT-3.5 default

### Vercel
- **Limit**: 100GB bandwidth, 100 hours serverless
- **Monitor**: Vercel dashboard, usage alerts
- **Mitigation**: Optimize API responses, implement caching

## Security Considerations

1. **API Keys**: Store in environment variables, never commit to git
2. **CORS**: Whitelist only production domain + localhost
3. **Rate Limiting**: Implement per-user and per-IP limits
4. **Input Validation**: Validate all user inputs (Pydantic models)
5. **SQL Injection**: Use parameterized queries (SQLAlchemy)
6. **XSS**: Sanitize user-generated content (quiz answers, chat)
7. **HTTPS**: Enforce HTTPS for all API calls
8. **Secrets Rotation**: Rotate JWT secret and API keys quarterly

## Performance Optimization

1. **Static Site**:
   - Lazy-load images below fold
   - Code splitting for interactive components
   - Preload critical fonts

2. **API**:
   - Cache translation results (1 week TTL)
   - Cache common chatbot queries (1 hour TTL)
   - Use connection pooling for DB

3. **RAG**:
   - Batch embed multiple chapters
   - Use approximate nearest neighbor (ANN) in Qdrant
   - Limit retrieved chunks to top-5

4. **CDN**:
   - GitHub Pages CDN for static assets
   - Vercel Edge Network for API responses
   - Cache headers for immutable resources

## Development Workflow

1. **Local Dev**:
   - Frontend: `npm run start` (Docusaurus dev server)
   - Backend: `uvicorn app.main:app --reload`
   - Use .env.local for API keys

2. **Preview Deploys**:
   - Every PR gets preview URL (Vercel + GitHub Pages preview)
   - Automated tests run on PR
   - Manual QA on preview before merge

3. **Production Deploy**:
   - Merge to main triggers deploy
   - Database migrations run automatically
   - Health checks validate deploy

4. **Content Updates**:
   - Authors edit markdown in `website/docs/`
   - Preview changes locally
   - PR → Review → Merge → Auto-deploy

## Open Questions & Future Research

1. **Interactive Simulations**: Investigate WebGL libraries (Three.js, Babylon.js) for 3D robot viz
2. **Offline Support**: Evaluate PWA for offline chapter reading
3. **Video Content**: Research video hosting (YouTube embed vs self-host)
4. **Analytics**: Consider privacy-friendly analytics (Plausible vs Google Analytics)
5. **Content Versioning**: Plan for updating chapters without breaking permalinks

## References

- [Docusaurus Documentation](https://docusaurus.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [Better-Auth Documentation](https://www.better-auth.com/)
- [Neon Serverless Postgres](https://neon.tech/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)
