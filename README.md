# 🤖 WEN AI — Universal AI Assistant Platform

<div align="center">

![WEN AI Banner](https://img.shields.io/badge/WEN_AI-Universal_Platform-7000FF?style=for-the-badge&logo=openai&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

**A next-generation, high-performance, extensible AI Assistant platform featuring Clean Architecture, Multi-Provider LLMs, Real-time Streaming, Document AI & RAG, System Prompts, and Admin Dashboard.**

[Features](#-key-features) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Documentation](#-api-endpoints)

</div>

---

## ✨ Key Features

- **⚡ Real-time SSE Streaming**: Ultra-fast Server-Sent Events for word-by-word token generation with auto-scroll and markdown syntax highlighting.
- **🔌 Multi-Provider AI Abstraction**: Unified provider interface supporting **OpenAI** (GPT-4o, GPT-4o-mini), **Google Gemini** (Gemini 1.5 Pro / Flash), **Anthropic Claude** (Claude 3.5 Sonnet), **Ollama** (Local LLMs), and a **Built-in Mock Fallback** for zero-API-key testing.
- **📄 Document AI & RAG Engine**: Upload and parse **PDF, DOCX, TXT, CSV, JSON, and Images**. Perform semantic vector search and ask questions strictly grounded in your documents.
- **🎨 Modern Dark-First Aesthetic**: Tailored with Tailwind CSS, Framer Motion, and electric violet (`#7000FF`) styling, custom scrollbars, and fluid animations.
- **🛡️ Secure Authentication**: JWT authentication with Argon2/Bcrypt password hashing, refresh token rotation, and role-based access control (`user` / `admin`).
- **🎛️ System Prompt Persona Manager**: Create, customize, and switch AI personas and system instructions instantly.
- **📊 Admin Control Center**: View usage analytics, total tokens consumed, active user accounts, and provider health diagnostics.
- **🐳 Dockerized Deployment**: 1-click startup using `docker-compose` with PostgreSQL, Redis, Qdrant, Backend, and Frontend.

---

## 🏛 Architecture

```
wen-ai/
├── frontend/                     # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── app/                  # App providers & routes
│   │   ├── pages/                # Chat, Documents, Prompts, Settings, Admin, Auth
│   │   ├── widgets/              # Sidebar, ChatArea, DocumentViewer, AdminStats
│   │   ├── features/             # Modular feature components & hooks
│   │   ├── entities/             # Data models & state
│   │   ├── shared/               # UI components, Axios API client, helpers
│   │   └── types/                # Strict TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                      # FastAPI Clean Architecture
│   ├── app/
│   │   ├── api/v1/endpoints/     # REST & Streaming endpoints
│   │   ├── core/                 # Config, Security, JWT, Logging
│   │   ├── database/             # SQLAlchemy DB Engine & Sessions
│   │   ├── models/               # Database ORM models
│   │   ├── schemas/              # Pydantic v2 Request/Response schemas
│   │   ├── services/             # Business logic layer
│   │   ├── repositories/         # Database query layer
│   │   ├── ai/                   # Unified LLM provider abstraction & registry
│   │   └── main.py               # Application entrypoint
│   └── requirements.txt
│
├── docker/                       # Dockerfiles
├── docker-compose.yml            # Multi-container orchestration
├── .env.example                  # Environment configuration template
└── README.md
```

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, PostCSS, Framer Motion
- **Icons**: Lucide React
- **State & Data**: Zustand, TanStack React Query, Axios
- **Markdown & Code**: React Markdown, Remark GFM, Rehype Highlight

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database ORM**: SQLAlchemy 2.0, SQLite (Local default) & PostgreSQL
- **Security**: JWT (`python-jose`/`pyjwt`), `passlib` / `bcrypt`
- **Streaming**: Server-Sent Events (SSE) / `StreamingResponse`
- **Document Processing**: `pypdf`, `python-docx`, `tiktoken`
- **Vector Search / RAG**: Modular Vector Store & Cosine Similarity

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- (Optional) Docker & Docker Compose

### 2. Environment Setup
```bash
# Clone the repository
git clone https://github.com/humoyun1773/wen-ai.git
cd wen-ai

# Copy environment variables
cp .env.example .env
```

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000` (API Docs: `http://localhost:8000/docs`).

### 4. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend UI will be live at `http://localhost:5173`.

---

## 🐳 Docker Deployment

Run the complete platform with a single command:
```bash
docker-compose up -d --build
```

---

## 🔒 Security & Best Practices
- All LLM API keys are managed exclusively in the backend `.env`. No secrets are exposed to the client.
- Password hashes use salt and secure standard algorithms.
- Protected routes validate JWT tokens on both HTTP requests and SSE event streams.

---

## 📄 License
This project is licensed under the MIT License.
