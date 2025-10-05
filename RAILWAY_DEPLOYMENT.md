# 🚀 Railway Backend Deployment Guide

## Quick Deploy Your FastAPI Backend to Railway

### Step 1: Deploy to Railway
1. **Go to [railway.app](https://railway.app)**
2. **Sign up/Login** with your GitHub account
3. **Click "Deploy from GitHub repo"**
4. **Select**: `UtkarshMani/rag-app`
5. **Railway will auto-detect** your Python app

### Step 2: Configure Environment Variables
In Railway dashboard, add these environment variables:

```bash
# GitHub Models API
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_MODELS_API_ENDPOINT=https://models.inference.ai.azure.com

# JWT Configuration  
JWT_SECRET_KEY=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database (Optional - uses local file if not set)
MONGODB_URL=mongodb+srv://your_mongodb_connection_string

# Application Settings
ALLOWED_ORIGINS=https://your-netlify-app.netlify.app
DEBUG=false
ENVIRONMENT=production
```

### Step 3: Get Your Railway URL
After deployment, Railway will give you a URL like:
`https://your-app-name.railway.app`

### Step 4: Update Frontend Configuration
Copy your Railway URL and update your Netlify environment variables:

**In Netlify Dashboard → Site Settings → Environment Variables:**
```bash
REACT_APP_API_URL=https://your-app-name.railway.app
```

## 🔧 Alternative: Render Deployment

### Deploy to Render:
1. **Go to [render.com](https://render.com)**
2. **Connect GitHub** and select your repo
3. **Configure build settings:**
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: Leave empty

### Environment Variables for Render:
Same as Railway configuration above.

## 🎯 Quick Setup Commands

Run these commands to prepare for deployment:

```bash
# Add deployment configs
git add .
git commit -m "Add Railway and Heroku deployment configs"
git push origin main
```

## ⚡ Expected Results

After deployment:
- ✅ Backend API running at: `https://your-backend.railway.app`
- ✅ Health check: `https://your-backend.railway.app/health`
- ✅ Frontend can connect to backend
- ✅ Login/signup will work

## 🔑 Important Notes

1. **GitHub Token**: Get from GitHub → Settings → Developer Settings → Personal Access Tokens
2. **JWT Secret**: Generate a long random string
3. **CORS**: Make sure to include your Netlify URL in ALLOWED_ORIGINS
4. **Database**: App works without MongoDB (uses local storage)

Choose **Railway** for the easiest deployment experience!