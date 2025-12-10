---
id: 002
title: Create Implementation Plan
stage: plan
date: 2025-12-10
surface: agent
model: claude-sonnet-4-5
feature: 001-physical-ai-textbook
branch: 001-physical-ai-textbook
user: system
command: /sp.plan
labels: ["architecture", "technical-design", "api-contracts", "database-schema", "deployment"]
links:
  spec: specs/001-physical-ai-textbook/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-physical-ai-textbook/plan.md
  - specs/001-physical-ai-textbook/research.md
  - specs/001-physical-ai-textbook/data-model.md
  - specs/001-physical-ai-textbook/quickstart.md
  - specs/001-physical-ai-textbook/contracts/auth-api.yaml
  - specs/001-physical-ai-textbook/contracts/chat-api.yaml
  - specs/001-physical-ai-textbook/contracts/translate-api.yaml
  - specs/001-physical-ai-textbook/contracts/personalize-api.yaml
  - CLAUDE.md (agent context updated)
tests:
  - Constitution check validation (all principles PASS)
  - API contract validation (OpenAPI 3.1.0 compliant)
---

## Prompt

User provided technical stack preferences:

### Frontend (Docusaurus)
- **Framework**: Docusaurus 3.x with React 18
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript for type safety
- **Features**:
  - Dark/Light mode toggle
  - Urdu RTL layout support
  - Responsive design for mobile/tablet/desktop
  - Interactive code examples with CodeSandbox/StackBlitz

### Backend (FastAPI)
- **Framework**: FastAPI (Python 3.11+)
- **Database**: Neon Postgres (serverless)
- **Vector DB**: Qdrant Cloud (free tier)
- **Authentication**: Better-Auth with JWT
- **APIs**:
  - /api/chat - RAG chatbot endpoint
  - /api/auth - Authentication endpoints
  - /api/translate - Urdu translation
  - /api/personalize - Content personalization

### AI/ML Components
- **LLM**: OpenAI GPT-4/GPT-3.5 for chatbot
- **Embeddings**: text-embedding-3-small for RAG
- **Speech**: OpenAI Whisper for voice commands
- **Translation**: Google Translate API for Urdu

### DevOps & Deployment
- **Hosting**: GitHub Pages (frontend), Vercel/Railway (backend)

Create comprehensive implementation plan following specification.

## Response snapshot

Created complete implementation plan with:

### Phase 0: Research (research.md)

**Technology Decisions Documented** (10 major decisions):
1. **Docusaurus 3.x** - Static site generator (best for educational content, MDX support, i18n)
2. **FastAPI** - Backend framework (async, automatic docs, ML ecosystem)
3. **Neon Postgres** - Serverless database (1GB free tier, auto-scaling)
4. **Qdrant Cloud** - Vector DB (1M vectors free, <50ms search)
5. **Better-Auth** - Authentication library (type-safe, flexible)
6. **OpenAI GPT-3.5/4** - LLM (best quality/cost for educational Q&A)
7. **Google Cloud Translation** - Urdu translation (best Urdu support)
8. **Tailwind + shadcn/ui** - UI components (utility-first, accessible)
9. **GitHub Pages** - Frontend hosting (free, CDN-backed)
10. **Vercel/Railway** - Backend hosting (serverless, zero-config)

**Alternatives Evaluated**: Nextra vs Docusaurus, Node.js vs FastAPI, PlanetScale vs Neon, Pinecone vs Qdrant, NextAuth vs Better-Auth, Claude vs OpenAI, Azure vs Google Translation

**Free Tier Limits Documented**: GitHub Pages (1GB site, 100GB bandwidth), Neon (1GB storage, 100 compute hours), Qdrant (1M vectors), OpenAI (usage-based), Vercel (100GB bandwidth)

**Tech Stack Summary Table**: 19 technology decisions with versions and purposes

### Phase 1: Design Documents

**data-model.md** - Database schema with:
- **8 Entities**: users, quizzes, quiz_questions, quiz_attempts, chat_sessions, chat_messages, translation_cache, user_progress
- **Relationships**: 6 relationships with cardinality (1:N for users→quiz_attempts, etc.)
- **Indexes**: 15+ indexes for query optimization
- **Constraints**: Foreign keys with CASCADE rules, check constraints for enums
- **JSONB Usage**: For quiz options, answers, chat context, RAG citations
- **Migration Strategy**: Alembic versioning, Neon branching for testing
- **Example Queries**: 4 common queries (user stats, quiz with questions, chat history, translation cache lookup)
- **Security**: Bcrypt password hashing, encrypted PII, SQL injection prevention

**API Contracts** (4 OpenAPI specs):

1. **auth-api.yaml** (8 endpoints):
   - POST /auth/register - User signup with proficiency levels
   - POST /auth/login - JWT authentication
   - POST /auth/logout - Token revocation
   - POST /auth/refresh - Token refresh
   - GET /auth/me - Current user profile
   - PUT /auth/profile - Update proficiency levels

2. **chat-api.yaml** (4 endpoints):
   - POST /chat/session - Create conversation
   - GET /chat/session/{id} - Message history
   - POST /chat/message - Send question (RAG response)
   - POST /chat/stream - Streaming response (SSE)
   - **Citations Schema**: chapter_id, title, excerpt, relevance_score, URL

3. **translate-api.yaml** (3 endpoints):
   - POST /translate - Translate chapter to Urdu
   - GET /translate/languages - Supported languages
   - GET /translate/cache/{chapter_id} - Check cache
   - **Caching Logic**: SHA-256 hash, 1-week TTL

4. **personalize-api.yaml** (6 endpoints):
   - GET /progress - Overall completion stats
   - POST /progress/chapter - Mark chapter complete
   - GET /recommendations - Personalized suggestions
   - GET /quiz/{id} - Fetch quiz questions
   - POST /quiz/{id}/submit - Grade quiz
   - GET /quiz/history - Past attempts

**quickstart.md** - Developer guide with:
- **8 Setup Sections**: Prerequisites, local dev, testing, content authoring, deployment, monitoring, troubleshooting, workflow
- **Environment Variables**: 11 required env vars for backend (DATABASE_URL, QDRANT_URL, API keys, JWT secrets)
- **Development Commands**: Start frontend (npm run start), backend (uvicorn), tests (pytest, jest)
- **Deployment Steps**: GitHub Pages via Actions, Vercel deployment with secrets
- **Content Authoring**: Markdown frontmatter format, code example syntax, image placement
- **Troubleshooting**: 6 common issues with solutions (CORS, DB connection, embeddings, translation, performance)

### plan.md - Master Implementation Plan

**Technical Context**:
- Languages: TypeScript 5.x (frontend), Python 3.11+ (backend)
- Dependencies: Docusaurus 3.x, React 18, Tailwind, shadcn/ui, FastAPI, Neon, Qdrant, Better-Auth
- Performance Goals: <3s page load, <5s chatbot, <10s translation, 1000 concurrent users
- Constraints: GitHub Pages 1GB limit, free tier quotas

**Project Structure**:
- Frontend: `website/` (Docusaurus, React components, markdown docs, static assets)
- Backend: `api/` (FastAPI, models, services, routes, DB migrations)
- Deployment: `.github/workflows/` (CI/CD for both frontend and backend)

**Constitution Check**: ✅ PASS
- Separation of concerns (static content vs APIs)
- Security (JWT, HTTPS, input validation, CORS)
- Performance (static generation, serverless, vector DB, caching)
- Testability (Jest, pytest, Playwright, >80% coverage)
- Maintainability (TypeScript, component architecture, OpenAPI docs)
- Accessibility (responsive, RTL Urdu, semantic HTML, ARIA)

**Agent Context Updated**: Added TypeScript/Python stack, Neon/Qdrant databases to CLAUDE.md

## Outcome

- ✅ Impact: Complete technical architecture defined for Physical AI textbook with hybrid static + serverless design
- 🧪 Tests: Constitution validation (6 principles PASS), API contracts (OpenAPI 3.1.0 compliant)
- 📁 Files: Created plan.md, research.md (10 tech decisions), data-model.md (8 entities, 15+ indexes), 4 API contracts (21 endpoints total), quickstart.md (8 sections), updated CLAUDE.md
- 🔁 Next prompts: Ready for `/sp.tasks` to generate actionable task list based on user stories and design artifacts
- 🧠 Reflection: Successfully decomposed complex educational platform into concrete architecture. Hybrid approach (static site + serverless APIs) balances performance (static delivery) with interactivity (auth, chatbot, personalization). Free tier constraints documented and accounted for. RAG architecture specified (Qdrant + OpenAI embeddings). Database schema supports all user stories with proper indexes and caching strategies.

## Evaluation notes (flywheel)

- Failure modes observed: None - architecture is sound and follows industry patterns for educational platforms
- Graders run and results (PASS/FAIL): Constitution Check - ALL PASS (Separation of concerns, Security, Performance, Testability, Maintainability, Accessibility)
- Prompt variant (if applicable): N/A - initial planning phase
- Next experiment (smallest change to try): Consider evaluating Supabase as alternative to Neon+Better-Auth combo (provides integrated auth + DB, but less flexibility)
