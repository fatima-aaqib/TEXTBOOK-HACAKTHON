# Tasks: Physical AI & Humanoid Robotics Textbook

**Input**: Design documents from `/specs/001-physical-ai-textbook/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are EXCLUDED per the template guidance.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with frontend (Docusaurus) and backend (FastAPI):
- **Frontend**: `website/` at repository root
- **Backend**: `api/` at repository root
- **Tests**: `tests/` at repository root
- **CI/CD**: `.github/workflows/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create root project structure with website/, api/, tests/, .github/ directories
- [x] T002 [P] Initialize Docusaurus project in website/ with TypeScript template
- [x] T003 [P] Initialize FastAPI project in api/ with Python 3.11+ and pyproject.toml
- [x] T004 [P] Create .env.example files for website/.env.local and api/.env
- [x] T005 [P] Initialize package.json in root for monorepo workspace management
- [x] T006 [P] Create .gitignore with node_modules, venv, .env, build artifacts
- [x] T007 [P] Initialize Git repository and create initial commit

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Configure Docusaurus with Tailwind CSS in website/docusaurus.config.js
- [x] T009 [P] Install and configure shadcn/ui components in website/src/components/ui/
- [x] T010 [P] Setup Neon Postgres database connection in api/app/db/session.py
- [x] T011 [P] Create Alembic migrations structure in api/app/db/migrations/
- [x] T012 [P] Setup Qdrant Cloud client in api/app/utils/vector_store.py
- [x] T013 [P] Configure OpenAI API client in api/app/utils/openai_client.py
- [x] T014 [P] Setup Google Cloud Translation API client in api/app/utils/translation_client.py
- [x] T015 [P] Create FastAPI app entry point in api/app/main.py with CORS middleware
- [x] T016 [P] Setup environment configuration in api/app/config.py with Pydantic settings
- [x] T017 [P] Create API error handling middleware in api/app/middleware/error_handler.py
- [x] T018 [P] Setup JWT utilities in api/app/utils/security.py (token generation, verification)
- [x] T019 Create Pydantic base models in api/app/models/base.py for request/response validation
- [x] T020 [P] Create database base models in api/app/models/db_base.py with SQLAlchemy declarative_base
- [ ] T021 Run database migrations to create schema (execute: alembic upgrade head)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse and Read Core Textbook Content (Priority: P1) 🎯 MVP

**Goal**: Deliver functional Docusaurus site with 4 modules, chapters, code examples, and simulation visuals

**Independent Test**: Deploy Docusaurus site locally, navigate to Module 1, read at least one chapter with code examples and visuals, verify responsive layout on mobile

### Implementation for User Story 1

- [ ] T022 [P] [US1] Create module directory structure in website/docs/ (module-1-ros2/, module-2-gazebo-unity/, module-3-isaac/, module-4-vla/)
- [ ] T023 [P] [US1] Configure sidebar navigation in website/sidebars.js with module categorization
- [ ] T024 [P] [US1] Create homepage in website/src/pages/index.tsx with module overview cards
- [ ] T025 [P] [US1] Write sample chapter 01-introduction.md for module-1-ros2/ with markdown frontmatter
- [ ] T026 [P] [US1] Write sample chapter 02-installation.md for module-1-ros2/ with code blocks (Python, C++)
- [ ] T027 [P] [US1] Create custom CodeBlock component in website/src/components/CodeBlock.tsx with syntax highlighting
- [ ] T028 [P] [US1] Add simulation visual images to website/static/img/simulations/ (robot-gazebo.png, isaac-sim.png)
- [ ] T029 [P] [US1] Configure Prism.js for code syntax highlighting in website/docusaurus.config.js
- [ ] T030 [P] [US1] Create responsive layout theme in website/src/css/custom.css with mobile breakpoints
- [ ] T031 [P] [US1] Add dark/light mode toggle using Docusaurus built-in theme switcher
- [ ] T032 [P] [US1] Create chapter navigation component in website/src/components/ChapterNav.tsx (previous/next buttons)
- [ ] T033 [P] [US1] Configure algolia/docusaurus search plugin in website/docusaurus.config.js
- [ ] T034 [US1] Build Docusaurus site (execute: npm run build in website/) and verify output in build/
- [ ] T035 [US1] Test site locally (execute: npm run start) and verify navigation, code highlighting, responsive layout

**Checkpoint**: At this point, User Story 1 (MVP) should be fully functional and testable independently

---

## Phase 4: User Story 2 - User Registration and Personalization (Priority: P2)

**Goal**: Implement Better-Auth authentication with user proficiency tracking and content personalization

**Independent Test**: Sign up new user with hardware/software levels, sign in, view profile, update proficiency, verify content adapts based on level

### Implementation for User Story 2

- [ ] T036 [P] [US2] Create users table migration in api/app/db/migrations/ (id, email, password_hash, hardware_level, software_level, timestamps)
- [ ] T037 [P] [US2] Create user_progress table migration in api/app/db/migrations/ (user_id, chapter_id, module_name, completed, reading_time)
- [ ] T038 [P] [US2] Create User model in api/app/models/user.py with SQLAlchemy ORM (matches users table schema)
- [ ] T039 [P] [US2] Create UserProgress model in api/app/models/progress.py with relationships to User
- [ ] T040 [P] [US2] Create registration Pydantic schemas in api/app/models/schemas/auth.py (RegistrationRequest, AuthResponse)
- [ ] T041 [P] [US2] Create user profile Pydantic schemas in api/app/models/schemas/user.py (UserProfile, ProfileUpdateRequest)
- [ ] T042 [US2] Implement UserService in api/app/services/user_service.py (create_user, get_user_by_email, update_profile)
- [ ] T043 [US2] Implement AuthService in api/app/services/auth_service.py (register, login, logout, refresh_token with JWT)
- [ ] T044 [P] [US2] Create auth routes in api/app/api/v1/auth.py (POST /register, /login, /logout, /refresh, GET /me, PUT /profile)
- [ ] T045 [P] [US2] Create AuthForm component in website/src/components/AuthForm.tsx with email/password/proficiency fields
- [ ] T046 [P] [US2] Create SignUp page in website/src/pages/signup.tsx with registration form and API integration
- [ ] T047 [P] [US2] Create SignIn page in website/src/pages/signin.tsx with login form and token storage
- [ ] T048 [P] [US2] Create user context provider in website/src/contexts/UserContext.tsx for global auth state
- [ ] T049 [P] [US2] Create Profile page in website/src/pages/profile.tsx with proficiency update form
- [ ] T050 [P] [US2] Create PersonalizedContent component in website/src/components/PersonalizedContent.tsx that shows/hides sections based on user level
- [ ] T051 [P] [US2] Create Dashboard page in website/src/pages/dashboard.tsx with personalized chapter recommendations
- [ ] T052 [US2] Implement PersonalizationService in api/app/services/personalization_service.py (get_recommendations based on user level and progress)
- [ ] T053 [P] [US2] Create personalize routes in api/app/api/v1/personalize.py (GET /progress, /recommendations, POST /progress/chapter)
- [ ] T054 [US2] Integrate PersonalizedContent component into sample chapter pages (show beginner/advanced sections conditionally)
- [ ] T055 [US2] Add authentication middleware to protected routes in api/app/middleware/auth.py (verify JWT on /me, /profile, /progress)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Interactive RAG Chatbot for Q&A (Priority: P3)

**Goal**: Implement RAG-powered chatbot using Qdrant and OpenAI with chapter citations

**Independent Test**: Index sample chapters into Qdrant, open chatbot UI, ask "How do I create a ROS 2 publisher?", verify response includes answer and chapter references

### Implementation for User Story 3

- [ ] T056 [P] [US3] Create chat_sessions table migration in api/app/db/migrations/ (id, user_id, created_at, updated_at, is_active)
- [ ] T057 [P] [US3] Create chat_messages table migration in api/app/db/migrations/ (id, session_id, role, content, retrieved_chunks JSONB, token_count)
- [ ] T058 [P] [US3] Create ChatSession model in api/app/models/chat.py with relationship to User and ChatMessage
- [ ] T059 [P] [US3] Create ChatMessage model in api/app/models/message.py with JSONB field for RAG context
- [ ] T060 [P] [US3] Create chat Pydantic schemas in api/app/models/schemas/chat.py (ChatMessageRequest, ChatMessageResponse, Citation)
- [ ] T061 [P] [US3] Create content indexing script in api/scripts/index_content.py to chunk markdown files and generate embeddings
- [ ] T062 [US3] Implement RAGService in api/app/services/rag_service.py (generate_embedding, search_similar_chunks, construct_prompt)
- [ ] T063 [US3] Implement ChatService in api/app/services/chat_service.py (create_session, send_message, get_history with RAG integration)
- [ ] T064 [P] [US3] Create chat routes in api/app/api/v1/chat.py (POST /session, /message, /stream, GET /session/{id})
- [ ] T065 [P] [US3] Create Chatbot component in website/src/components/Chatbot.tsx with floating chat icon and expandable interface
- [ ] T066 [P] [US3] Create ChatMessage component in website/src/components/ChatMessage.tsx to display user/assistant messages with citations
- [ ] T067 [P] [US3] Create Citation component in website/src/components/Citation.tsx as clickable chapter reference links
- [ ] T068 [US3] Integrate Chatbot component into website/src/theme/Root.tsx (global component on all pages)
- [ ] T069 [US3] Add chat state management in website/src/contexts/ChatContext.tsx (session ID, message history)
- [ ] T070 [US3] Implement streaming response support in Chatbot component (SSE client for /chat/stream endpoint)
- [ ] T071 [US3] Execute content indexing script to populate Qdrant with chapter embeddings (execute: python api/scripts/index_content.py --input website/docs/)
- [ ] T072 [US3] Add rate limiting middleware in api/app/middleware/rate_limiter.py (10 queries/hour for anonymous, unlimited for authenticated)

**Checkpoint**: All user stories 1, 2, and 3 should now be independently functional

---

## Phase 6: User Story 4 - Urdu Translation for Accessibility (Priority: P4)

**Goal**: Implement one-click Urdu translation with caching and technical term preservation

**Independent Test**: Open any chapter, click "Translate to Urdu", verify content translates (with code blocks preserved), click "Show Original" to revert

### Implementation for User Story 4

- [ ] T073 [P] [US4] Create translation_cache table migration in api/app/db/migrations/ (id, chapter_id, language, original_hash, translated_content, cached_at, expires_at)
- [ ] T074 [P] [US4] Create TranslationCache model in api/app/models/translation.py with unique constraint on (chapter_id, language, original_hash)
- [ ] T075 [P] [US4] Create translation Pydantic schemas in api/app/models/schemas/translation.py (TranslationRequest, TranslationResponse)
- [ ] T076 [US4] Implement TranslationService in api/app/services/translation_service.py (translate_chapter, check_cache, store_cache with Google Cloud API)
- [ ] T077 [P] [US4] Create translate routes in api/app/api/v1/translate.py (POST /translate, GET /languages, /cache/{chapter_id})
- [ ] T078 [P] [US4] Create TranslateButton component in website/src/components/TranslateButton.tsx with Urdu toggle
- [ ] T079 [P] [US4] Configure i18n plugin in website/docusaurus.config.js with Urdu (ur) locale and RTL support
- [ ] T080 [P] [US4] Create translation utilities in website/src/utils/translation.ts (compute SHA-256 hash, preserve code blocks)
- [ ] T081 [US4] Integrate TranslateButton component into chapter layout (website/src/theme/DocItem/Layout/index.tsx)
- [ ] T082 [US4] Add translation state management in website/src/contexts/TranslationContext.tsx (current language, translation cache)
- [ ] T083 [US4] Implement RTL layout switching in website/src/css/custom.css for Urdu content
- [ ] T084 [US4] Add technical term preservation logic (mark "ROS 2", "DDS", "Gazebo" as do-not-translate in API)

**Checkpoint**: User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Assessment System for Learning Validation (Priority: P5)

**Goal**: Create quizzes with multiple-choice and short-answer questions, instant grading, and project suggestions

**Independent Test**: Navigate to end of Module 1, click "Take Quiz", answer questions, submit, verify score and feedback display

### Implementation for User Story 5

- [ ] T085 [P] [US5] Create quizzes table migration in api/app/db/migrations/ (id, module_name, title, description, passing_score, time_limit_minutes, is_published)
- [ ] T086 [P] [US5] Create quiz_questions table migration in api/app/db/migrations/ (id, quiz_id, question_text, question_type, options JSONB, correct_answer, explanation, points, order_index)
- [ ] T087 [P] [US5] Create quiz_attempts table migration in api/app/db/migrations/ (id, user_id, quiz_id, answers JSONB, score, max_score, passed, started_at, submitted_at)
- [ ] T088 [P] [US5] Create Quiz model in api/app/models/quiz.py with relationship to QuizQuestion
- [ ] T089 [P] [US5] Create QuizQuestion model in api/app/models/quiz_question.py with JSONB for multiple choice options
- [ ] T090 [P] [US5] Create QuizAttempt model in api/app/models/quiz_attempt.py with JSONB for user answers and feedback
- [ ] T091 [P] [US5] Create quiz Pydantic schemas in api/app/models/schemas/quiz.py (Quiz, QuizQuestion, QuizSubmission, QuizResult)
- [ ] T092 [US5] Implement QuizService in api/app/services/quiz_service.py (get_quiz, submit_quiz, grade_answers, get_history)
- [ ] T093 [P] [US5] Create quiz routes in api/app/api/v1/quiz.py (GET /quiz/{id}, POST /quiz/{id}/submit, GET /quiz/history)
- [ ] T094 [P] [US5] Create QuizInterface component in website/src/components/QuizInterface.tsx with question display and answer input
- [ ] T095 [P] [US5] Create QuizQuestion component in website/src/components/QuizQuestion.tsx for multiple choice and short answer rendering
- [ ] T096 [P] [US5] Create QuizResults component in website/src/components/QuizResults.tsx with score, feedback, and project suggestions
- [ ] T097 [P] [US5] Create Quiz page in website/src/pages/quiz/[quizId].tsx with dynamic routing
- [ ] T098 [US5] Add quiz links to chapter pages (add "Take Quiz" button at end of module chapters)
- [ ] T099 [US5] Implement quiz timer logic in QuizInterface component (count down from time_limit_minutes)
- [ ] T100 [US5] Create seed script in api/scripts/seed_quizzes.py to populate sample quizzes for each module
- [ ] T101 [US5] Execute seed script to create quizzes (execute: python api/scripts/seed_quizzes.py)

**Checkpoint**: All user stories 1-5 should work independently

---

## Phase 8: User Story 6 - GitHub Pages Deployment (Priority: P6)

**Goal**: Automate deployment of Docusaurus site to GitHub Pages and backend APIs to Vercel

**Independent Test**: Push to main branch, verify GitHub Actions workflow runs, check deployed site at GitHub Pages URL, test API endpoints

### Implementation for User Story 6

- [ ] T102 [P] [US6] Update docusaurus.config.js with GitHub Pages URL and baseUrl for production
- [ ] T103 [P] [US6] Create deploy-site.yml workflow in .github/workflows/ for GitHub Pages deployment (build → gh-pages branch)
- [ ] T104 [P] [US6] Create test-frontend.yml workflow in .github/workflows/ for frontend CI (lint, build check)
- [ ] T105 [P] [US6] Create test-backend.yml workflow in .github/workflows/ for backend CI (pytest, type checking)
- [ ] T106 [P] [US6] Create vercel.json in api/ with Python runtime configuration and environment variables
- [ ] T107 [P] [US6] Configure Vercel project and add secrets (DATABASE_URL, QDRANT_URL, OPENAI_API_KEY, etc.)
- [ ] T108 [US6] Update CORS_ORIGINS in api/app/config.py to include production GitHub Pages URL
- [ ] T109 [US6] Update website/.env.production with production API URL (Vercel deployment URL)
- [ ] T110 [US6] Test deployment workflow by pushing to main branch and monitoring Actions logs
- [ ] T111 [US6] Verify deployed site is accessible at https://[username].github.io/physical-ai-textbook/
- [ ] T112 [US6] Verify API health endpoint is accessible at Vercel deployment URL (/health)

**Checkpoint**: Complete deployment pipeline functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T113 [P] Add README.md in repository root with project overview, setup instructions, and contribution guidelines
- [ ] T114 [P] Create CONTRIBUTING.md with development workflow and coding standards
- [ ] T115 [P] Add OpenAPI documentation UI at /docs endpoint using FastAPI automatic docs
- [ ] T116 [P] Implement analytics tracking (Plausible or Google Analytics) in website/docusaurus.config.js
- [ ] T117 [P] Add sitemap generation in website/docusaurus.config.js for SEO
- [ ] T118 [P] Create error boundary component in website/src/components/ErrorBoundary.tsx for graceful error handling
- [ ] T119 [P] Add loading states to all API-dependent components (Chatbot, QuizInterface, Profile)
- [ ] T120 [P] Implement retry logic for failed API requests in website/src/utils/api.ts
- [ ] T121 [P] Add database cleanup script in api/scripts/cleanup_db.py (delete expired translations, old chat sessions)
- [ ] T122 [P] Create monitoring script in api/scripts/monitor_usage.py (track OpenAI token usage, DB size, vector count)
- [ ] T123 [P] Add accessibility audit using Lighthouse and fix ARIA label issues
- [ ] T124 [P] Optimize images in website/static/img/ (compress PNGs, use WebP format)
- [ ] T125 [P] Add meta tags for social media sharing in website/docusaurus.config.js (Open Graph, Twitter Cards)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for content to index (but can be implemented in parallel)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on US1 for chapters to translate (but can be implemented in parallel)
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Depends on US1 for module structure (but can be implemented in parallel)
- **User Story 6 (P6)**: Can start after Foundational (Phase 2) - No dependencies on other stories (deployment infrastructure)

### Within Each User Story

- Tasks marked [P] can run in parallel within the same story
- Models before services
- Services before routes
- Routes before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T007) can run in parallel (different files)
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each story:
  - All tasks marked [P] can run in parallel
  - Models can be created in parallel
  - UI components can be created in parallel
  - Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1 (MVP)

Launch all parallelizable tasks for User Story 1 together:

```bash
# All these tasks can run simultaneously (different files, no dependencies):
Task T022: "Create module directory structure in website/docs/"
Task T023: "Configure sidebar navigation in website/sidebars.js"
Task T024: "Create homepage in website/src/pages/index.tsx"
Task T025: "Write sample chapter 01-introduction.md for module-1-ros2/"
Task T026: "Write sample chapter 02-installation.md for module-1-ros2/"
Task T027: "Create custom CodeBlock component in website/src/components/CodeBlock.tsx"
Task T028: "Add simulation visual images to website/static/img/simulations/"
Task T029: "Configure Prism.js for code syntax highlighting"
Task T030: "Create responsive layout theme in website/src/css/custom.css"
Task T031: "Add dark/light mode toggle"
Task T032: "Create chapter navigation component"
Task T033: "Configure algolia/docusaurus search plugin"
```

After all parallel tasks complete, run sequential tasks:
```bash
Task T034: "Build Docusaurus site"
Task T035: "Test site locally and verify"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T021) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T022-T035)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy to GitHub Pages using US6 tasks
6. Demo MVP to users

**MVP Deliverable**: Functional educational textbook with 4 modules, sample chapters, code examples, syntax highlighting, responsive design, dark mode

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Add authentication and personalization)
4. Add User Story 3 → Test independently → Deploy/Demo (Add chatbot)
5. Add User Story 4 → Test independently → Deploy/Demo (Add Urdu translation)
6. Add User Story 5 → Test independently → Deploy/Demo (Add quizzes)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T021)
2. Once Foundational is done, split work:
   - **Developer A**: User Story 1 (T022-T035) - MVP content delivery
   - **Developer B**: User Story 2 (T036-T055) - Auth and personalization
   - **Developer C**: User Story 3 (T056-T072) - RAG chatbot
   - **Developer D**: User Story 6 (T102-T112) - Deployment infrastructure
3. As developers complete stories, they pick up US4, US5, or help with polish tasks
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Tests are NOT included (specification does not request TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are concrete and actionable
- Frontend = website/, Backend = api/, Tests = tests/, CI = .github/workflows/

**Total Tasks**: 125 tasks across 9 phases
- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 14 tasks (BLOCKS all user stories)
- **Phase 3 (US1 - MVP)**: 14 tasks
- **Phase 4 (US2 - Auth)**: 20 tasks
- **Phase 5 (US3 - Chatbot)**: 17 tasks
- **Phase 6 (US4 - Translation)**: 12 tasks
- **Phase 7 (US5 - Quizzes)**: 17 tasks
- **Phase 8 (US6 - Deployment)**: 11 tasks
- **Phase 9 (Polish)**: 13 tasks

**Parallel Opportunities**: 85+ tasks marked [P] can run in parallel (68% of all tasks!)
