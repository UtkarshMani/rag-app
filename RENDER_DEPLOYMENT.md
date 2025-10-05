# Render Deployment Guide

## 🔵 Deploy FastAPI Backend to Render

### Step 1: Create Web Service
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect GitHub and select `UtkarshMani/rag-app`

### Step 2: Configure Service Settings

**Basic Settings:**
- **Name**: `rag-app-backend`
- **Region**: `Oregon (US West)` or closest to you
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Runtime**: `Python 3`

**Build & Deploy:**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Environment Variables
Add these in Render dashboard:

```bash
# Required - GitHub API
GITHUB_TOKEN=your_github_personal_access_token

# Required - JWT Security
JWT_SECRET_KEY=super_secret_jwt_key_make_it_long_and_random_12345
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Required - CORS
ALLOWED_ORIGINS=https://your-netlify-app.netlify.app

# Optional - App Settings
DEBUG=false
ENVIRONMENT=production
PYTHON_VERSION=3.11
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait 3-5 minutes for deployment
- Get your URL: `https://rag-app-backend.onrender.com`

### Step 5: Update Frontend
In Netlify dashboard, update environment variable:
```bash
REACT_APP_API_URL=https://rag-app-backend.onrender.com
```

## 🔑 GitHub Token Setup:
1. GitHub → Settings → Developer Settings → Personal Access Tokens (Classic)
2. Generate new token with `repo` and `read:user` permissions
3. Copy token to Render environment variables

## ✅ Expected Results:
- Backend URL: `https://your-app.onrender.com`
- Health check: `https://your-app.onrender.com/health`
- API docs: `https://your-app.onrender.com/docs`