# 🚀 Netlify Deployment Guide for RAG Application

## 📋 Prerequisites
- GitHub repository with your RAG application
- Netlify account (free tier available)
- Backend deployed separately (Railway, Render, or Heroku)

## 🔧 Deployment Steps

### Step 1: Prepare Your Repository
Your repository is now configured for Netlify deployment with:
- `netlify.toml` - Build and redirect configuration
- Frontend environment variables set up
- Clean project structure

### Step 2: Deploy to Netlify

#### Option A: Netlify Dashboard (Recommended)
1. **Login to Netlify** at https://netlify.com
2. **Click "New site from Git"**
3. **Connect to GitHub** and select your `rag-app` repository
4. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
   - Base directory: `frontend`
5. **Set environment variables:**
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   REACT_APP_ENVIRONMENT=production
   ```
6. **Deploy site**

#### Option B: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project root
netlify deploy --prod --dir=frontend/build
```

### Step 3: Configure Environment Variables
In Netlify dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add these variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.herokuapp.com
   REACT_APP_ENVIRONMENT=production
   REACT_APP_APP_NAME=RAG Chat Application
   ```

### Step 4: Custom Domain (Optional)
1. **Buy a domain** or use existing one
2. **In Netlify dashboard:** Domain settings → Add custom domain
3. **Configure DNS** to point to Netlify

## 🔗 Backend Deployment Options

Since Netlify only hosts frontend (static files), you need to deploy your backend separately:

### Option 1: Railway (Recommended - $5/month)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy backend
railway login
cd backend
railway init
railway up
```

### Option 2: Render (Free tier available)
1. Connect GitHub repository to Render
2. Select backend folder
3. Configure environment variables
4. Deploy

### Option 3: Heroku (Paid plans only)
```bash
# Install Heroku CLI and deploy
heroku create your-rag-backend
git subtree push --prefix=backend heroku main
```

## 📁 Project Structure for Netlify
```
rag-app/
├── netlify.toml              # Netlify configuration
├── frontend/                 # React app (deployed to Netlify)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env.production
├── backend/                  # FastAPI (deploy separately)
│   ├── main.py
│   ├── requirements.txt
│   └── ...
└── docs/                     # Documentation
```

## 🔧 Build Process
When you push to GitHub, Netlify will:
1. **Detect changes** in your repository
2. **Run build command:** `npm run build` in frontend directory
3. **Install dependencies** automatically
4. **Build React app** for production
5. **Deploy to CDN** with global distribution
6. **Generate preview URL** for testing

## 🌐 Live URLs
After deployment, you'll get:
- **Production URL:** `https://your-site-name.netlify.app`
- **Custom domain:** `https://your-domain.com` (if configured)
- **Preview URLs** for each deployment

## 🔒 Security Features
The `netlify.toml` includes:
- **SPA redirects** - All routes redirect to index.html
- **Security headers** - XSS protection, frame options, etc.
- **Static asset caching** - Optimized performance
- **HTTPS by default** - SSL certificate included

## 📊 Performance Optimizations
- **Global CDN** - Fast loading worldwide
- **Automatic compression** - Gzip and Brotli
- **Asset optimization** - Images and CSS/JS minification
- **Caching strategies** - Static assets cached for 1 year

## 🛠️ Troubleshooting

### Common Issues:
1. **Build fails:** Check Node.js version in build logs
2. **API calls fail:** Verify REACT_APP_API_URL is set correctly
3. **Routes don't work:** Ensure redirects are configured in netlify.toml
4. **Environment variables:** Make sure they start with REACT_APP_

### Debug Commands:
```bash
# Test build locally
cd frontend
npm run build
npm install -g serve
serve -s build

# Check environment variables
echo $REACT_APP_API_URL
```

## 💰 Cost Breakdown
- **Netlify:** Free for personal projects (100GB bandwidth)
- **Backend hosting:** $5-20/month depending on provider
- **Custom domain:** $10-15/year (optional)
- **Total:** $0-35/month

## 🚀 Continuous Deployment
- **Automatic deploys** on GitHub push
- **Preview deploys** for pull requests
- **Branch deploys** for feature testing
- **Deploy notifications** via email/Slack

## 📋 Post-Deployment Checklist
- [ ] Frontend loads correctly
- [ ] API calls work with backend
- [ ] Authentication flow functional
- [ ] File upload works
- [ ] Mobile responsive
- [ ] All routes accessible
- [ ] Environment variables set
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active
- [ ] Performance optimized

---

*Your RAG application is now live on Netlify with professional hosting, global CDN, and automatic deployments!*