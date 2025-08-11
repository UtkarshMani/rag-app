# RAG Application with ChromaDB

A complete Retrieval-Augmented Generation (RAG) application built with FastAPI backend and React frontend, using ChromaDB for vector storage and GitHub Models for LLM integration.

## 🚀 Features

- **Document Upload & Processing**: Support for PDF, TXT, DOCX, and MD files
- **Vector Search**: ChromaDB-based semantic search with HuggingFace embeddings
- **Chat Interface**: Interactive RAG-powered question answering
- **User Authentication**: JWT-based authentication with role-based access control
- **Real-time Chat**: Streaming responses with chat history persistence
- **Modern Architecture**: FastAPI backend + React frontend + MongoDB for persistence

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **ChromaDB** - Vector database for embeddings
- **HuggingFace Transformers** - Sentence embeddings (all-MiniLM-L6-v2)
- **GitHub Models API** - LLM integration
- **MongoDB** - Chat history persistence
- **JWT** - Authentication and authorization

### Frontend
- **React** - UI framework
- **Axios** - HTTP client
- **Modern CSS** - Responsive design

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+
- MongoDB
- GitHub Personal Access Token with `models` scope

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/UtkarshMani/rag-app.git
cd rag-app
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Configuration
Create `backend/.env`:
```env
GITHUB_API_KEY=your_github_personal_access_token
EMBEDDING_MODEL=all-MiniLM-L6-v2
VECTOR_STORE_PATH=./chroma_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_ALGORITHM=HS256
MONGODB_URI=mongodb://localhost:27017
CORS_ORIGINS=http://localhost:3000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

### 5. Start Services

**Start MongoDB:**
```bash
sudo systemctl start mongod
```

**Start Backend (Terminal 1):**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 👤 Default Users

- **Admin**: `admin` / `adminpass`
- **User**: `user` / `userpass`

## 🔧 Usage

### Upload Documents
- Login with admin credentials
- Use the upload interface to add documents
- Documents are automatically processed and stored in ChromaDB

### Chat with Documents
- Ask questions about uploaded documents
- The RAG system retrieves relevant content and generates responses

## 📁 Project Structure

```
rag-app/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── vector_store.py      # ChromaDB integration
│   ├── github_llm.py        # GitHub Models integration
│   ├── auth.py              # Authentication logic
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/                 # React components
│   ├── package.json         # Node.js dependencies
│   └── public/              # Static files
├── start-backend.sh         # Backend startup script
├── start-frontend.sh        # Frontend startup script
└── README.md               # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ using modern AI and web technologies**
