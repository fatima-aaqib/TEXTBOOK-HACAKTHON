# Implementation Plan: Physical AI & Humanoid Robotics Textbook

**Branch**: `001-physical-ai-textbook` | **Date**: 2025-12-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-physical-ai-textbook/spec.md`

## Summary

Build a comprehensive educational platform for Physical AI and Humanoid Robotics delivered as a Docusaurus-based static website with dynamic features. The textbook covers 4 core modules (ROS 2, Gazebo & Unity, NVIDIA Isaac, VLA Models) with interactive elements including a RAG-powered chatbot, user authentication with personalization, Urdu translation, code examples, quizzes, and automated GitHub Pages deployment. The architecture follows a hybrid approach: static site generation for content delivery with serverless backend APIs for dynamic features (auth, chatbot, personalization).

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Python 3.11+ (backend APIs)
**Primary Dependencies**:
- Frontend: Docusaurus 3.x, React 18, Tailwind CSS, shadcn/ui, Better-Auth client
- Backend: FastAPI, Neon Postgres (serverless), Qdrant Cloud (vector DB), Better-Auth
**Storage**: Neon Postgres for user data/quiz results, Qdrant Cloud for RAG embeddings, markdown files for content
**Testing**: Jest + React Testing Library (frontend), pytest (backend), Playwright (E2E)
**Target Platform**: Web (GitHub Pages for static hosting, serverless backend on Vercel/Railway/similar)
**Project Type**: Web application (hybrid static + serverless)
**Performance Goals**:
- Page load <3s on 3G
- Chatbot response <5s
- Translation <10s per chapter
- Quiz scoring <2s
- Support 1000 concurrent users
**Constraints**:
- GitHub Pages limits (1GB site size, 100GB bandwidth/month)
- Free tier constraints (Qdrant, Neon, OpenAI API quotas)
- Static site compatibility (pre-rendering, client-side auth)
**Scale/Scope**:
- 4 modules with ~50 chapters total
- ~500 code examples
- ~100 simulation visuals
- Target: 100+ monthly active users initially, scale to 10k+

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Constitution file contains template placeholders. Applying standard web application principles:

### Standard Web Application Principles Applied:

1. **Separation of Concerns**: ✅ PASS
   - Frontend (Docusaurus/React) handles presentation
   - Backend APIs handle business logic (auth, RAG, personalization)
   - Clear boundary between static content and dynamic features

2. **Security First**: ✅ PASS
   - JWT-based authentication with Better-Auth
   - HTTPS required for all API communication
   - Environment variables for secrets (API keys, DB credentials)
   - Input validation on all API endpoints
   - CORS configuration for cross-origin requests

3. **Performance & Scalability**: ✅ PASS
   - Static site generation for fast content delivery
   - Serverless architecture for auto-scaling APIs
   - Vector DB for efficient RAG retrieval
   - Caching strategies (translation cache, quiz results)

4. **Testability**: ✅ PASS
   - Unit tests for components and API endpoints
   - Integration tests for user flows
   - E2E tests for critical paths (signup, quiz, chatbot)
   - Test coverage goals: >80% for business logic

5. **Maintainability**: ✅ PASS
   - TypeScript for type safety
   - Component-based architecture (React/shadcn)
   - API documentation (OpenAPI/Swagger)
   - Clear separation of content (markdown) from code

6. **Accessibility**: ✅ PASS
   - Responsive design for mobile/tablet/desktop
   - RTL support for Urdu translation
   - Semantic HTML and ARIA labels
   - Keyboard navigation support

**No violations identified**. Architecture follows industry best practices for educational platforms.

## Project Structure

### Documentation (this feature)

```text
specs/001-physical-ai-textbook/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (database schema)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (API specifications)
│   ├── auth-api.yaml
│   ├── chat-api.yaml
│   ├── personalize-api.yaml
│   └── translate-api.yaml
├── checklists/
│   └── requirements.md  # Specification validation
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)

# Static Site (Docusaurus)
website/
├── docs/                # Textbook content (markdown)
│   ├── module-1-ros2/
│   │   ├── 01-introduction.md
│   │   ├── 02-installation.md
│   │   └── ...
│   ├── module-2-gazebo-unity/
│   ├── module-3-isaac/
│   └── module-4-vla/
├── src/
│   ├── components/      # React components
│   │   ├── Chatbot.tsx
│   │   ├── AuthForm.tsx
│   │   ├── QuizInterface.tsx
│   │   ├── TranslateButton.tsx
│   │   └── PersonalizedContent.tsx
│   ├── pages/           # Custom pages
│   │   ├── index.tsx    # Homepage
│   │   ├── dashboard.tsx
│   │   └── profile.tsx
│   ├── theme/           # Docusaurus theme customization
│   ├── css/             # Tailwind styles
│   └── utils/           # Client-side utilities
├── static/              # Static assets
│   ├── img/             # Simulation visuals, diagrams
│   └── videos/
├── docusaurus.config.js
├── sidebars.js
└── package.json

# Backend APIs (FastAPI)
api/
├── app/
│   ├── main.py          # FastAPI app entry
│   ├── config.py        # Environment config
│   ├── models/          # Pydantic models + DB models
│   │   ├── user.py
│   │   ├── quiz.py
│   │   ├── chat.py
│   │   └── translation.py
│   ├── services/        # Business logic
│   │   ├── auth_service.py
│   │   ├── rag_service.py
│   │   ├── personalization_service.py
│   │   ├── translation_service.py
│   │   └── quiz_service.py
│   ├── api/             # API routes
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── chat.py
│   │       ├── personalize.py
│   │       ├── translate.py
│   │       └── quiz.py
│   ├── db/              # Database utilities
│   │   ├── session.py
│   │   └── migrations/
│   └── utils/           # Helpers
│       ├── vector_store.py  # Qdrant integration
│       ├── embeddings.py    # OpenAI embeddings
│       └── security.py      # JWT, hashing
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── requirements.txt
└── pyproject.toml

# Testing
tests/
├── e2e/                 # Playwright tests
│   ├── auth.spec.ts
│   ├── chatbot.spec.ts
│   └── quiz.spec.ts
└── playwright.config.ts

# Configuration
.github/
└── workflows/
    ├── deploy-site.yml  # Deploy to GitHub Pages
    ├── test-backend.yml # Backend CI
    └── test-frontend.yml # Frontend CI

# Root level
├── .env.example         # Environment template
├── README.md            # Project documentation
└── package.json         # Monorepo/workspace config
```

**Structure Decision**: Hybrid web application with:
- **Frontend (website/)**: Docusaurus static site with React components for interactive features
- **Backend (api/)**: FastAPI serverless APIs for auth, RAG, personalization, translation
- **Deployment**: GitHub Pages for static site, serverless platform (Vercel/Railway) for APIs
- **Content**: Markdown files in `website/docs/` organized by module
- **Assets**: Static images/diagrams in `website/static/`

This structure separates content authoring (markdown) from code, enables independent deployment of frontend and backend, and allows content contributors to work without touching code.

## Complexity Tracking

> **No violations - complexity tracking not required**

Architecture follows standard patterns for educational platforms:
- Static site generation is industry standard for documentation/textbooks
- Serverless APIs are appropriate for variable traffic patterns
- Vector database is standard for RAG implementations
- Separation of frontend/backend is conventional for modern web apps

---

**Phase 0 (Research) and Phase 1 (Design) outputs will be generated next.**
