# Physical AI & Humanoid Robotics Textbook

An interactive educational platform for learning Physical AI and Humanoid Robotics, covering ROS 2, Gazebo, Unity, NVIDIA Isaac, and Vision-Language-Action (VLA) models.

## 🎯 Features

- **📚 4 Core Modules**: ROS 2, Gazebo & Unity, NVIDIA Isaac, VLA Models
- **💬 RAG-Powered Chatbot**: AI assistant with chapter citations
- **👤 User Authentication**: Personalized learning paths
- **🌐 Urdu Translation**: One-click chapter translation
- **📝 Assessment System**: Quizzes and project suggestions
- **🎨 Dark Mode**: Built-in theme switcher
- **📱 Responsive Design**: Works on all devices

## 🏗️ Project Structure

```
physical-ai-textbook/
├── website/          # Docusaurus frontend (TypeScript + React)
│   ├── docs/        # Textbook content (Markdown)
│   ├── src/         # React components
│   └── static/      # Images and assets
├── api/             # FastAPI backend (Python 3.11+)
│   ├── app/         # Application code
│   ├── tests/       # Backend tests
│   └── scripts/     # Utility scripts
├── tests/           # E2E tests (Playwright)
└── .github/         # CI/CD workflows
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Python** 3.11+
- **Git**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/physical-ai-textbook.git
   cd physical-ai-textbook
   ```

2. **Install dependencies**:
   ```bash
   # Install root and frontend dependencies
   npm run install:all

   # Install backend dependencies
   cd api
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   ```bash
   # Frontend
   cp website/.env.example website/.env.local

   # Backend
   cp api/.env.example api/.env
   # Edit api/.env with your API keys (Neon, Qdrant, OpenAI, Google Cloud)
   ```

4. **Run the development servers**:
   ```bash
   # Terminal 1: Frontend (http://localhost:3000)
   npm run dev:website

   # Terminal 2: Backend (http://localhost:8000)
   npm run dev:api
   ```

## 📖 Documentation

- **Specification**: [specs/001-physical-ai-textbook/spec.md](specs/001-physical-ai-textbook/spec.md)
- **Implementation Plan**: [specs/001-physical-ai-textbook/plan.md](specs/001-physical-ai-textbook/plan.md)
- **Tasks**: [specs/001-physical-ai-textbook/tasks.md](specs/001-physical-ai-textbook/tasks.md)
- **Quickstart Guide**: [specs/001-physical-ai-textbook/quickstart.md](specs/001-physical-ai-textbook/quickstart.md)

## 🧪 Testing

```bash
# Frontend tests
cd website
npm run test

# Backend tests
cd api
pytest

# E2E tests
cd tests
npx playwright test
```

## 🚢 Deployment

### Frontend (GitHub Pages)

Push to `main` branch triggers automatic deployment via GitHub Actions.

### Backend (Vercel/Railway)

1. Configure Vercel project
2. Add environment variables
3. Deploy: `vercel --prod`

See [quickstart.md](specs/001-physical-ai-textbook/quickstart.md) for detailed instructions.

## 🛠️ Tech Stack

### Frontend
- Docusaurus 3.x
- React 18
- TypeScript 5.x
- Tailwind CSS
- shadcn/ui

### Backend
- FastAPI
- Python 3.11+
- Neon Postgres
- Qdrant (Vector DB)
- OpenAI API
- Google Cloud Translation

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📧 Support

For issues and questions, visit our [GitHub Issues](https://github.com/your-org/physical-ai-textbook/issues).

---

Built with [Spec-Driven Development](https://github.com/anthropics/specify) 🚀
