# Quickstart Guide: Physical AI & Humanoid Robotics Textbook

**Date**: 2025-12-10
**Feature**: 001-physical-ai-textbook
**Purpose**: Developer setup and deployment instructions

## Overview

This guide walks through setting up the Physical AI textbook platform locally and deploying to production. The platform consists of:
- **Frontend**: Docusaurus static site (website/)
- **Backend**: FastAPI serverless APIs (api/)
- **Databases**: Neon Postgres, Qdrant Cloud (vector DB)

## Prerequisites

### Required Software

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **Python**: 3.11+ ([Download](https://www.python.org/downloads/))
- **Git**: Latest version
- **npm** or **pnpm**: Package manager
- **Code Editor**: VS Code recommended

### Required Accounts (Free Tiers)

- **GitHub**: For repository and Pages hosting
- **Neon**: Serverless Postgres ([neon.tech](https://neon.tech))
- **Qdrant Cloud**: Vector database ([cloud.qdrant.io](https://cloud.qdrant.io))
- **OpenAI**: API for chatbot and embeddings ([platform.openai.com](https://platform.openai.com))
- **Google Cloud**: Translation API ([cloud.google.com](https://cloud.google.com))
- **Vercel** or **Railway**: Backend hosting ([vercel.com](https://vercel.com) or [railway.app](https://railway.app))

---

## Part 1: Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/physical-ai-textbook.git
cd physical-ai-textbook
```

### Step 2: Install Frontend Dependencies

```bash
cd website
npm install
# or
pnpm install
```

### Step 3: Install Backend Dependencies

```bash
cd ../api
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Create `.env` files in both `website/` and `api/` directories:

**website/.env.local**:
```env
# API URL (for local dev, use localhost)
NEXT_PUBLIC_API_URL=http://localhost:8000/v1

# Optional: Enable analytics
# NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

**api/.env**:
```env
# Database (Neon Postgres)
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require

# Qdrant Cloud
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key

# Google Cloud Translation
GOOGLE_CLOUD_API_KEY=your_google_api_key

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# CORS (allow frontend origin)
CORS_ORIGINS=http://localhost:3000,https://your-site.github.io

# Environment
ENVIRONMENT=development
```

### Step 5: Initialize Database

Run database migrations:

```bash
cd api
alembic upgrade head
```

### Step 6: Index Content for RAG

Generate embeddings for textbook content:

```bash
python scripts/index_content.py --input ../website/docs --output embeddings.json
```

This script:
1. Reads all markdown files from `website/docs/`
2. Chunks content into ~500-token segments
3. Generates embeddings using OpenAI
4. Uploads to Qdrant Cloud

### Step 7: Start Development Servers

Open two terminal windows:

**Terminal 1 - Frontend**:
```bash
cd website
npm run start
# Site runs on http://localhost:3000
```

**Terminal 2 - Backend**:
```bash
cd api
uvicorn app.main:app --reload --port 8000
# API runs on http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Step 8: Verify Setup

1. **Frontend**: Visit http://localhost:3000 → Should see homepage
2. **Backend**: Visit http://localhost:8000/docs → Should see OpenAPI docs
3. **Health Check**: `curl http://localhost:8000/health` → Should return `{"status": "ok"}`

---

## Part 2: Running Tests

### Frontend Tests

```bash
cd website

# Unit tests
npm run test

# E2E tests (requires running dev server)
npm run test:e2e

# Coverage
npm run test:coverage
```

### Backend Tests

```bash
cd api

# Unit tests
pytest tests/unit -v

# Integration tests (requires database)
pytest tests/integration -v

# All tests with coverage
pytest --cov=app tests/
```

---

## Part 3: Content Authoring

### Adding a New Chapter

1. Create markdown file in appropriate module directory:
   ```bash
   cd website/docs/module-1-ros2
   touch 05-new-chapter.md
   ```

2. Add frontmatter and content:
   ```markdown
   ---
   title: "Your Chapter Title"
   module: "ros2"
   chapter: 5
   estimated_reading_time: 20
   difficulty: "intermediate"
   keywords: ["ros2", "nodes", "topics"]
   ---

   # Your Chapter Title

   Your content here...
   ```

3. Update `website/sidebars.js` to include new chapter

4. Preview locally: `npm run start`

5. Commit and push:
   ```bash
   git add .
   git commit -m "docs: add new ROS 2 chapter"
   git push
   ```

### Adding Code Examples

Use fenced code blocks with language identifier:

````markdown
```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        self.get_logger().info('Node started')

if __name__ == '__main__':
    rclpy.init()
    node = MyNode()
    rclpy.spin(node)
```
````

### Adding Simulation Visuals

1. Place images in `website/static/img/simulations/`
2. Reference in markdown:
   ```markdown
   ![Robot simulation](../static/img/simulations/robot-gazebo.png)
   ```

---

## Part 4: Deployment

### Deploy Frontend to GitHub Pages

1. **Configure GitHub Pages**:
   - Go to repository settings → Pages
   - Source: GitHub Actions

2. **Update `docusaurus.config.js`**:
   ```javascript
   module.exports = {
     url: 'https://your-username.github.io',
     baseUrl: '/physical-ai-textbook/',
     organizationName: 'your-org',
     projectName: 'physical-ai-textbook',
     ...
   };
   ```

3. **Deploy via GitHub Actions** (already configured in `.github/workflows/deploy-site.yml`):
   ```bash
   git push origin main
   # Actions will auto-deploy to GitHub Pages
   ```

### Deploy Backend to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Configure `vercel.json`** in `api/`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "app/main.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "app/main.py"
       }
     ],
     "env": {
       "DATABASE_URL": "@database-url",
       "QDRANT_URL": "@qdrant-url",
       "QDRANT_API_KEY": "@qdrant-api-key",
       "OPENAI_API_KEY": "@openai-api-key",
       "GOOGLE_CLOUD_API_KEY": "@google-api-key",
       "JWT_SECRET": "@jwt-secret",
       "JWT_REFRESH_SECRET": "@jwt-refresh-secret"
     }
   }
   ```

3. **Add secrets to Vercel**:
   ```bash
   cd api
   vercel secrets add database-url "postgresql://..."
   vercel secrets add qdrant-url "https://..."
   vercel secrets add qdrant-api-key "your_key"
   vercel secrets add openai-api-key "sk-..."
   vercel secrets add google-api-key "your_key"
   vercel secrets add jwt-secret "your_secret"
   vercel secrets add jwt-refresh-secret "your_refresh_secret"
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

5. **Update frontend API URL**:
   - In `website/.env.production`:
     ```env
     NEXT_PUBLIC_API_URL=https://your-api.vercel.app/v1
     ```

### Alternative: Deploy Backend to Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize**:
   ```bash
   railway login
   cd api
   railway init
   ```

3. **Add environment variables** in Railway dashboard

4. **Deploy**:
   ```bash
   railway up
   ```

---

## Part 5: Monitoring & Maintenance

### Health Checks

**Frontend**:
- Check site is live: https://your-username.github.io/physical-ai-textbook/
- Verify pages load and navigation works

**Backend**:
- Health endpoint: https://your-api.vercel.app/health
- API docs: https://your-api.vercel.app/docs

### Database Maintenance

**Clean old data**:
```sql
-- Delete expired translation cache
DELETE FROM translation_cache WHERE expires_at < NOW();

-- Archive old quiz attempts (>1 year)
INSERT INTO quiz_attempts_archive SELECT * FROM quiz_attempts WHERE submitted_at < NOW() - INTERVAL '1 year';
DELETE FROM quiz_attempts WHERE submitted_at < NOW() - INTERVAL '1 year';

-- Delete inactive chat sessions (>30 days)
DELETE FROM chat_sessions WHERE updated_at < NOW() - INTERVAL '30 days' AND is_active = FALSE;
```

**Monitor storage**:
- Neon dashboard: Check DB size (free tier: 1GB limit)
- Qdrant dashboard: Check vector count (free tier: 1M vectors)

### Cost Monitoring

**OpenAI**:
- Dashboard: https://platform.openai.com/usage
- Set monthly budget alerts
- Monitor token usage per feature (chatbot vs embeddings)

**Google Cloud**:
- Translation quota: Check characters translated
- Free tier: 500k characters/month

**Vercel/Railway**:
- Monitor bandwidth and function invocations
- Free tier limits: 100GB bandwidth, 100 hours serverless

---

## Part 6: Troubleshooting

### Frontend Issues

**Problem**: Site not loading after deploy
- **Solution**: Check `docusaurus.config.js` has correct `url` and `baseUrl`
- Verify GitHub Actions workflow completed successfully

**Problem**: API calls failing (CORS errors)
- **Solution**: Update `CORS_ORIGINS` in backend `.env` to include frontend URL

### Backend Issues

**Problem**: Database connection refused
- **Solution**: Check `DATABASE_URL` is correct (include `?sslmode=require` for Neon)
- Verify IP allowlist in Neon dashboard

**Problem**: Embeddings not working (chatbot returns no context)
- **Solution**: Re-run `python scripts/index_content.py`
- Check Qdrant API key and cluster URL

**Problem**: Translation API errors
- **Solution**: Verify Google Cloud API key is valid
- Enable Translation API in Google Cloud Console

### Performance Issues

**Problem**: Slow page loads
- **Solution**: Optimize images in `website/static/img/`
- Enable lazy loading for below-fold content
- Check bundle size: `npm run build -- --analyze`

**Problem**: Slow chatbot responses
- **Solution**: Reduce number of retrieved chunks (top-5 → top-3)
- Use GPT-3.5-turbo instead of GPT-4 for simple queries
- Implement response caching

---

## Part 7: Development Workflow

### Feature Development

1. Create feature branch:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Make changes and test locally

3. Run tests:
   ```bash
   npm run test  # Frontend
   pytest        # Backend
   ```

4. Commit with conventional commits:
   ```bash
   git commit -m "feat: add quiz timer feature"
   ```

5. Push and create pull request:
   ```bash
   git push origin feature/new-feature
   ```

6. Wait for CI checks to pass

7. Merge to main → Auto-deploy

### Content Updates

Content-only changes (markdown in `website/docs/`) can be edited directly in GitHub:
1. Navigate to file on GitHub
2. Click "Edit this file" (pencil icon)
3. Make changes, commit directly to main
4. Auto-deploy triggers

---

## Part 8: Additional Resources

### Documentation

- **Docusaurus**: https://docusaurus.io/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **Better-Auth**: https://www.better-auth.com/docs
- **OpenAI API**: https://platform.openai.com/docs
- **Qdrant**: https://qdrant.tech/documentation/

### Support

- **GitHub Issues**: https://github.com/your-org/physical-ai-textbook/issues
- **Discussions**: https://github.com/your-org/physical-ai-textbook/discussions
- **Email**: support@physicalai-textbook.com

---

## Summary

You've successfully set up the Physical AI textbook platform! Key points:
- ✅ Frontend runs on Docusaurus (GitHub Pages)
- ✅ Backend APIs run on FastAPI (Vercel/Railway)
- ✅ Content is markdown files (easy to author)
- ✅ RAG chatbot uses OpenAI + Qdrant
- ✅ Translation via Google Cloud
- ✅ CI/CD via GitHub Actions

Next steps:
1. Author content for all 4 modules
2. Create quizzes for each module
3. Test with users and gather feedback
4. Iterate based on usage analytics

Happy building! 🤖📚
