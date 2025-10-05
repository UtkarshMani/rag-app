# 🚀 RAG Application Deployment Guide

## Overview
This guide explains how to deploy your RAG application so visitors can demo it online before downloading and using it locally.

## 🌐 Hosting Options

### Option 1: Frontend + Backend Separate Hosting (Recommended)

#### **Frontend Deployment (React App)**
**Platform:** Netlify or Vercel (Free tiers available)

**Steps:**
1. **Build the React app:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Auto-deploy on GitHub pushes

3. **Environment Variables:**
   ```env
   REACT_APP_API_URL=https://your-backend-url.com
   ```

#### **Backend Deployment (FastAPI)**
**Platform:** Railway, Render, or Heroku

**Railway Deployment (Recommended):**
1. Connect your GitHub repository
2. Select the backend folder
3. Railway auto-detects Python and installs dependencies
4. Set environment variables in Railway dashboard

**Environment Variables for Backend:**
```env
GITHUB_TOKEN=your_github_models_token
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PORT=8000
```

### Option 2: Full-Stack Hosting

#### **Railway (Full-Stack)**
- Deploy both frontend and backend on Railway
- Supports monorepo deployments
- PostgreSQL database available
- Custom domain support

#### **Render**
- Free tier with limitations
- Supports Python + Node.js
- Built-in PostgreSQL
- Auto-deploy from GitHub

### Option 3: Cloud Platform Deployment

#### **Google Cloud Platform**
- Cloud Run for containerized deployment
- Cloud Storage for file uploads
- Firestore for user data

#### **AWS**
- Elastic Beanstalk for easy deployment
- S3 for file storage
- RDS for database

## 📋 Pre-Deployment Checklist

### **1. Environment Configuration**
Create production environment files:

**Frontend (.env.production):**
```env
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_ENVIRONMENT=production
```

**Backend (.env):**
```env
GITHUB_TOKEN=your_github_models_token
SECRET_KEY=your_production_jwt_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["https://your-frontend-domain.com"]
DATABASE_URL=your_production_database_url
```

### **2. Code Modifications for Production**

**Update CORS settings in backend/main.py:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Update API base URL in frontend/src/api.js:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

### **3. Database Configuration**
- Replace ChromaDB file storage with persistent cloud storage
- Consider using PostgreSQL with pgvector for production
- Set up proper backup strategies

## 🔧 Step-by-Step Deployment

### **Step 1: Prepare Repository**
1. Create `railway.json` in root:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false
  }
}
```

2. Create `Procfile` for backend:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

3. Update `requirements.txt` with production dependencies:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
langchain==0.0.345
chromadb==0.4.18
sentence-transformers==2.2.2
PyPDF2==3.0.1
python-docx==0.8.11
psycopg2-binary==2.9.7
```

### **Step 2: Deploy Backend**
1. Sign up for Railway/Render
2. Connect GitHub repository
3. Select backend folder for deployment
4. Set environment variables
5. Deploy and get backend URL

### **Step 3: Deploy Frontend**
1. Update frontend API URL to backend deployment URL
2. Build the React app
3. Deploy to Netlify/Vercel
4. Configure custom domain (optional)

### **Step 4: Test and Optimize**
1. Test all functionality in production
2. Monitor performance and errors
3. Set up analytics (optional)
4. Configure CDN for better performance

## 🎯 Demo Setup for Visitors

### **Landing Page Enhancement**
Add a demo section to your frontend:

1. **Demo Mode Toggle:**
   - Provide sample documents for testing
   - Pre-populate with example queries
   - Show expected responses

2. **Usage Instructions:**
   - Clear steps for visitors to try the demo
   - Explanation of RAG functionality
   - Links to GitHub repository for local setup

3. **Feature Showcase:**
   - Highlight key features
   - Show document upload process
   - Demonstrate chat functionality

### **Sample Demo Content**
Create sample documents and queries:

**Sample Documents:**
- AI/ML research papers
- Company documentation
- Technical guides

**Sample Queries:**
- "What is Retrieval-Augmented Generation?"
- "How does the system process documents?"
- "What are the key features of this application?"

## 🔐 Security Considerations

### **Production Security:**
1. **Environment Variables:** Never commit secrets to repository
2. **HTTPS:** Ensure all communications are encrypted
3. **CORS:** Restrict origins to your frontend domain
4. **Rate Limiting:** Implement API rate limits
5. **Input Validation:** Sanitize all user inputs

### **Demo Security:**
1. **File Upload Limits:** Restrict file sizes and types
2. **User Isolation:** Separate demo users from real users
3. **Resource Limits:** Prevent abuse of AI API calls
4. **Session Management:** Clear demo sessions regularly

## 📊 Monitoring and Analytics

### **Application Monitoring:**
- Set up error tracking (Sentry)
- Monitor API performance
- Track user interactions
- Monitor resource usage

### **Demo Analytics:**
- Track demo usage patterns
- Monitor conversion to downloads
- Analyze user feedback
- A/B test demo features

## 💰 Cost Estimation

### **Free Tier Options:**
- **Netlify:** 100GB bandwidth, 300 build minutes
- **Vercel:** 100GB bandwidth, 6000 edge function executions
- **Railway:** $5/month for hobby plan with generous limits
- **Render:** Free tier with 750 hours/month

### **Estimated Monthly Costs:**
- **Light Usage (Demo):** $0-15/month
- **Medium Usage:** $15-50/month
- **Heavy Usage:** $50-200/month

## 🚀 Quick Start Commands

### **Deploy to Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init
railway up
```

### **Deploy to Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=build
```

## 📝 Post-Deployment Checklist

- [ ] Backend API accessible and responding
- [ ] Frontend loads and connects to backend
- [ ] Authentication system working
- [ ] File upload functionality working
- [ ] Chat/RAG functionality working
- [ ] Mobile responsiveness tested
- [ ] Performance optimized
- [ ] Error handling in place
- [ ] Demo content populated
- [ ] Analytics configured
- [ ] Security measures implemented
- [ ] Documentation updated with live URLs

## 🔗 Useful Resources

- [Railway Documentation](https://docs.railway.app/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

---

*This deployment guide ensures your RAG application is accessible to visitors for demo purposes while maintaining security and performance standards.*