# Data Model: Physical AI & Humanoid Robotics Textbook

**Date**: 2025-12-10
**Feature**: 001-physical-ai-textbook
**Phase**: Phase 1 - Database Schema Design

## Overview

This document defines the database schema for the Physical AI textbook platform. The data model supports user authentication, personalization, quiz tracking, chatbot conversations, and translation caching. The schema is designed for Neon Postgres (serverless) with consideration for performance, scalability, and data integrity.

## Entity Relationship Diagram

```
┌──────────┐         ┌────────────────┐         ┌──────────┐
│  users   │─────────│  quiz_attempts │─────────│  quizzes │
└──────────┘    1:N  └────────────────┘    N:1  └──────────┘
     │                                                 │
     │ 1:N                                        1:N  │
     │                                                 │
┌────────────────┐                          ┌──────────────┐
│ chat_sessions  │                          │quiz_questions│
└────────────────┘                          └──────────────┘
     │
     │ 1:N
     │
┌────────────────┐
│ chat_messages  │
└────────────────┘

┌────────────────────┐
│ translation_cache  │  (standalone cache table)
└────────────────────┘

┌────────────────────┐
│ user_progress      │  (many-to-many: users ↔ chapters)
└────────────────────┘
```

## Core Entities

### 1. users

Stores user account information, authentication credentials, and proficiency levels.

**Table: `users`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email (login) |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `full_name` | VARCHAR(255) | NULL | User display name |
| `hardware_level` | VARCHAR(20) | NOT NULL, CHECK IN ('beginner', 'intermediate', 'advanced') | Hardware proficiency |
| `software_level` | VARCHAR(20) | NOT NULL, CHECK IN ('beginner', 'intermediate', 'advanced') | Software proficiency |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last profile update |
| `last_login_at` | TIMESTAMP | NULL | Last successful login |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Account status |

**Indexes**:
- `idx_users_email` on `email` (for login lookups)
- `idx_users_created_at` on `created_at` (for analytics)

**Validation Rules**:
- Email format: Must match email regex
- Password: Min 8 characters, hashed with bcrypt (cost 12)
- Proficiency levels: Enum-validated in application layer

---

### 2. quizzes

Stores quiz metadata for each module.

**Table: `quizzes`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique quiz identifier |
| `module_name` | VARCHAR(100) | NOT NULL | Module (e.g., "ros2", "gazebo-unity") |
| `title` | VARCHAR(255) | NOT NULL | Quiz display title |
| `description` | TEXT | NULL | Quiz instructions |
| `passing_score` | INTEGER | NOT NULL, DEFAULT 70 | Minimum score to pass (0-100) |
| `time_limit_minutes` | INTEGER | NULL | Time limit (NULL = unlimited) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Quiz creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last quiz update |
| `is_published` | BOOLEAN | NOT NULL, DEFAULT FALSE | Quiz availability |

**Indexes**:
- `idx_quizzes_module` on `module_name` (for filtering by module)
- `idx_quizzes_published` on `is_published` (for active quizzes)

---

### 3. quiz_questions

Stores individual questions for quizzes.

**Table: `quiz_questions`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique question identifier |
| `quiz_id` | UUID | NOT NULL, FOREIGN KEY → quizzes(id) ON DELETE CASCADE | Parent quiz |
| `question_text` | TEXT | NOT NULL | Question prompt |
| `question_type` | VARCHAR(20) | NOT NULL, CHECK IN ('multiple_choice', 'short_answer') | Question format |
| `options` | JSONB | NULL | Options for multiple choice (array of strings) |
| `correct_answer` | TEXT | NOT NULL | Correct answer (option index or text) |
| `explanation` | TEXT | NULL | Answer explanation |
| `points` | INTEGER | NOT NULL, DEFAULT 1 | Points awarded |
| `order_index` | INTEGER | NOT NULL | Display order in quiz |

**Indexes**:
- `idx_quiz_questions_quiz_id` on `quiz_id` (for fetching quiz questions)
- `idx_quiz_questions_order` on `(quiz_id, order_index)` (for sorted retrieval)

**JSONB Example** (`options` for multiple choice):
```json
["ROS 2 is a middleware", "ROS 2 is an operating system", "ROS 2 is a programming language", "ROS 2 is a robot model"]
```

---

### 4. quiz_attempts

Tracks user attempts at quizzes with their answers and scores.

**Table: `quiz_attempts`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique attempt identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE | User taking quiz |
| `quiz_id` | UUID | NOT NULL, FOREIGN KEY → quizzes(id) ON DELETE CASCADE | Quiz being attempted |
| `answers` | JSONB | NOT NULL | User's answers (array of {question_id, answer}) |
| `score` | INTEGER | NOT NULL | Final score (0-100) |
| `max_score` | INTEGER | NOT NULL | Total possible points |
| `passed` | BOOLEAN | NOT NULL | Whether attempt passed |
| `started_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Attempt start time |
| `submitted_at` | TIMESTAMP | NULL | Attempt submission time |
| `time_taken_seconds` | INTEGER | NULL | Time spent on quiz |

**Indexes**:
- `idx_quiz_attempts_user_quiz` on `(user_id, quiz_id)` (for user quiz history)
- `idx_quiz_attempts_submitted` on `submitted_at` (for analytics)

**JSONB Example** (`answers`):
```json
[
  {"question_id": "uuid-1", "answer": "0"},
  {"question_id": "uuid-2", "answer": "ROS 2 uses DDS for communication"}
]
```

**Business Logic**:
- `passed` = `score >= quiz.passing_score`
- `time_taken_seconds` = `submitted_at - started_at` (in seconds)

---

### 5. chat_sessions

Groups chat messages into sessions for context management.

**Table: `chat_sessions`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique session identifier |
| `user_id` | UUID | NULL, FOREIGN KEY → users(id) ON DELETE SET NULL | User (NULL for anonymous) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Session start time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last message time |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Session status |
| `context_summary` | TEXT | NULL | AI-generated session summary |

**Indexes**:
- `idx_chat_sessions_user` on `user_id` (for user's chat history)
- `idx_chat_sessions_active` on `is_active` (for active sessions)

**Notes**:
- Sessions auto-close after 1 hour of inactivity (application logic)
- `context_summary` generated after 10+ messages for token efficiency

---

### 6. chat_messages

Stores individual messages within chat sessions.

**Table: `chat_messages`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique message identifier |
| `session_id` | UUID | NOT NULL, FOREIGN KEY → chat_sessions(id) ON DELETE CASCADE | Parent session |
| `role` | VARCHAR(20) | NOT NULL, CHECK IN ('user', 'assistant', 'system') | Message sender |
| `content` | TEXT | NOT NULL | Message text |
| `retrieved_chunks` | JSONB | NULL | RAG context used (array of {chapter, text, score}) |
| `token_count` | INTEGER | NULL | Token usage |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Message timestamp |

**Indexes**:
- `idx_chat_messages_session` on `session_id` (for retrieving conversation)
- `idx_chat_messages_created` on `created_at` (for time-series queries)

**JSONB Example** (`retrieved_chunks`):
```json
[
  {
    "chapter_id": "module-1/02-installation",
    "text": "To install ROS 2 Humble on Ubuntu 22.04...",
    "score": 0.89
  },
  {
    "chapter_id": "module-1/03-first-node",
    "text": "Creating a ROS 2 publisher involves...",
    "score": 0.76
  }
]
```

---

### 7. translation_cache

Caches translated chapter content to avoid redundant API calls.

**Table: `translation_cache`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique cache entry |
| `chapter_id` | VARCHAR(255) | NOT NULL | Chapter identifier (path) |
| `language` | VARCHAR(10) | NOT NULL | Target language (ISO 639-1) |
| `original_hash` | VARCHAR(64) | NOT NULL | SHA-256 of source content |
| `translated_content` | TEXT | NOT NULL | Translated markdown |
| `cached_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Cache creation time |
| `expires_at` | TIMESTAMP | NULL | Cache expiration (1 week) |

**Indexes**:
- `idx_translation_cache_lookup` on `(chapter_id, language, original_hash)` (for cache hits)
- `idx_translation_cache_expires` on `expires_at` (for cleanup)

**Constraints**:
- UNIQUE `(chapter_id, language, original_hash)`

**Cache Logic**:
- Before translating, check if cached entry exists with matching `original_hash`
- If cache hit and not expired, return `translated_content`
- If miss, call Translation API, store result with `expires_at = NOW() + INTERVAL '7 days'`
- Cleanup job runs daily to DELETE WHERE `expires_at < NOW()`

---

### 8. user_progress

Tracks which chapters users have completed and their reading progress.

**Table: `user_progress`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique progress entry |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE | User |
| `chapter_id` | VARCHAR(255) | NOT NULL | Chapter identifier (path) |
| `module_name` | VARCHAR(100) | NOT NULL | Module for filtering |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether chapter finished |
| `last_read_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last interaction time |
| `reading_time_seconds` | INTEGER | NOT NULL, DEFAULT 0 | Total time spent |

**Indexes**:
- `idx_user_progress_user_chapter` on `(user_id, chapter_id)` (for progress lookup)
- `idx_user_progress_module` on `(user_id, module_name)` (for module completion %)

**Constraints**:
- UNIQUE `(user_id, chapter_id)`

**Business Logic**:
- Mark `completed = TRUE` when user scrolls to bottom of chapter
- Update `reading_time_seconds` on page unload (JS beacon)
- Calculate module completion: `COUNT(completed) / TOTAL_CHAPTERS * 100`

---

## Content Metadata (Not in DB)

**Note**: Chapter metadata is stored in markdown frontmatter, not in the database. Example:

```yaml
---
title: "Introduction to ROS 2"
module: "ros2"
chapter: 1
estimated_reading_time: 15
difficulty: "beginner"
keywords: ["ros2", "middleware", "dds"]
---
```

This metadata is:
- Indexed at build time for search
- Used for RAG chunking (difficulty level for personalization)
- Displayed in UI (reading time, difficulty badge)

---

## Relationships & Cardinality

| Relationship | Type | Description |
|--------------|------|-------------|
| users → quiz_attempts | 1:N | A user can attempt many quizzes |
| quizzes → quiz_attempts | 1:N | A quiz can have many attempts |
| quizzes → quiz_questions | 1:N | A quiz contains many questions |
| users → chat_sessions | 1:N | A user can have many chat sessions |
| chat_sessions → chat_messages | 1:N | A session contains many messages |
| users → user_progress | 1:N | A user has progress for many chapters |

---

## Data Integrity & Constraints

### Foreign Keys with Cascade Rules

1. **quiz_attempts.user_id → users.id**: ON DELETE CASCADE
   - If user deleted, remove their quiz attempts

2. **quiz_attempts.quiz_id → quizzes.id**: ON DELETE CASCADE
   - If quiz deleted, remove all attempts

3. **quiz_questions.quiz_id → quizzes.id**: ON DELETE CASCADE
   - If quiz deleted, remove all questions

4. **chat_messages.session_id → chat_sessions.id**: ON DELETE CASCADE
   - If session deleted, remove all messages

5. **chat_sessions.user_id → users.id**: ON DELETE SET NULL
   - If user deleted, keep sessions for analytics (anonymize)

6. **user_progress.user_id → users.id**: ON DELETE CASCADE
   - If user deleted, remove progress

### Check Constraints

- `users.hardware_level` IN ('beginner', 'intermediate', 'advanced')
- `users.software_level` IN ('beginner', 'intermediate', 'advanced')
- `quiz_questions.question_type` IN ('multiple_choice', 'short_answer')
- `quiz_attempts.score` BETWEEN 0 AND 100
- `quizzes.passing_score` BETWEEN 0 AND 100
- `chat_messages.role` IN ('user', 'assistant', 'system')

---

## Migration Strategy

### Initial Schema Creation

```sql
-- Run migrations in order:
1. Create extensions (uuid-ossp, pgcrypto)
2. Create users table
3. Create quizzes table
4. Create quiz_questions table
5. Create quiz_attempts table
6. Create chat_sessions table
7. Create chat_messages table
8. Create translation_cache table
9. Create user_progress table
10. Create indexes
11. Add foreign keys
12. Add check constraints
```

### Schema Versioning

- Use Alembic (Python) for migrations
- Version format: `YYYYMMDD_HHMMSS_description.py`
- Never modify existing migrations (additive only)
- Test migrations on Neon branch before production

---

## Performance Considerations

### Query Optimization

1. **User Login**: Index on `users.email` (unique)
2. **Quiz Retrieval**: Composite index on `(quiz_id, order_index)` for sorted questions
3. **Progress Tracking**: Unique index on `(user_id, chapter_id)` for UPSERT
4. **Chat History**: Index on `session_id` for message retrieval
5. **Translation Cache**: Composite unique index on `(chapter_id, language, original_hash)`

### Data Archival

- Archive quiz attempts older than 1 year to `quiz_attempts_archive` table
- Delete chat sessions inactive for 30+ days
- Cleanup expired translation cache daily

### Connection Pooling

- Use SQLAlchemy async pool (min=5, max=20 connections)
- Neon serverless auto-scales but pool prevents stampedes

---

## Security & Privacy

### Sensitive Data

- **Password Storage**: Bcrypt with cost 12 (never store plaintext)
- **JWT Secrets**: Rotate every 90 days (env var: JWT_SECRET)
- **API Keys**: Never log, store in secure env vars

### PII Handling

- User email is PII → Encrypt at rest (Neon encryption enabled)
- GDPR compliance: Support user data export (JSON) and deletion
- Anonymize chat sessions when user deleted (SET NULL on user_id)

### SQL Injection Prevention

- Use parameterized queries (SQLAlchemy ORM)
- Validate all inputs with Pydantic models
- Escape JSONB user inputs

---

## Example Queries

### 1. Get User Profile with Stats

```sql
SELECT
  u.id,
  u.email,
  u.full_name,
  u.hardware_level,
  u.software_level,
  COUNT(DISTINCT qa.id) AS total_quizzes_taken,
  COUNT(DISTINCT CASE WHEN qa.passed THEN qa.id END) AS quizzes_passed,
  COUNT(DISTINCT up.chapter_id) AS chapters_completed
FROM users u
LEFT JOIN quiz_attempts qa ON u.id = qa.user_id
LEFT JOIN user_progress up ON u.id = up.user_id AND up.completed = TRUE
WHERE u.id = $1
GROUP BY u.id;
```

### 2. Get Quiz with Questions

```sql
SELECT
  q.id AS quiz_id,
  q.title,
  q.passing_score,
  jsonb_agg(
    jsonb_build_object(
      'id', qq.id,
      'question', qq.question_text,
      'type', qq.question_type,
      'options', qq.options,
      'points', qq.points
    ) ORDER BY qq.order_index
  ) AS questions
FROM quizzes q
JOIN quiz_questions qq ON q.id = qq.quiz_id
WHERE q.id = $1 AND q.is_published = TRUE
GROUP BY q.id;
```

### 3. Get Recent Chat Messages

```sql
SELECT
  cm.role,
  cm.content,
  cm.retrieved_chunks,
  cm.created_at
FROM chat_messages cm
WHERE cm.session_id = $1
ORDER BY cm.created_at ASC
LIMIT 50;
```

### 4. Check Translation Cache

```sql
SELECT translated_content
FROM translation_cache
WHERE chapter_id = $1
  AND language = $2
  AND original_hash = $3
  AND (expires_at IS NULL OR expires_at > NOW())
LIMIT 1;
```

---

## Future Enhancements

1. **User Achievements**: Badges for milestones (e.g., "Complete all ROS 2 quizzes")
2. **Discussion Forums**: Tables for threads, posts, replies
3. **Content Ratings**: Allow users to rate chapter helpfulness
4. **Learning Paths**: Curated sequences of chapters for different goals
5. **Collaborative Filtering**: Recommend chapters based on similar users

---

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon Postgres Guide](https://neon.tech/docs/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [Alembic Migrations](https://alembic.sqlalchemy.org/)
