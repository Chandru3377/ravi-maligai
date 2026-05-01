# Production Deployment Setup Guide

## Overview

This guide helps you deploy your MERN stack grocery management system to production with proper environment-based API configuration.

## Prerequisites

- Node.js 16+ and npm installed
- MongoDB Atlas database (already configured)
- Render account for backend deployment
- Vercel or similar platform for frontend (optional, can use any host)

## Step 1: Backend Deployment (Render)

### 1.1 Deploy Backend to Render

1. Go to [Render.com](https://render.com)
2. Connect your GitHub repository
3. Create new **Web Service**
4. Configure:
   - **Name**: `ravi-maligai` (or similar)
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`

### 1.2 Set Environment Variables on Render

In Render dashboard → Environment:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grocerydb
NODE_ENV=production
PORT=4000
```

### 1.3 Enable CORS in Backend

Update `server/index.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',                    // Development
    'https://your-frontend-url.vercel.app',   // Production URL
    'https://ravi-maligai-frontend.vercel.app' // Change to your actual URL
  ],
  credentials: true
}));
```

### 1.4 Note Your Backend URL

After deployment, you'll get a URL like: `https://ravi-maligai.onrender.com`

## Step 2: Frontend Configuration

### 2.1 Environment Files Setup

The project already has:
- `.env.development` → `VITE_API_URL=http://localhost:4000`
- `.env.production` → `VITE_API_URL=https://ravi-maligai.onrender.com`

**Update the production URL** to match your Render backend URL.

### 2.2 Verify API Configuration

Check `src/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const BASE_URL = `${API_URL}/api`;
```

This automatically uses:
- `http://localhost:4000` in development
- `https://ravi-maligai.onrender.com` in production

### 2.3 Verify Socket Configuration

Check `src/socket.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const socket = io(API_URL, { autoConnect: true });
```

## Step 3: Local Development Testing

### 3.1 Start Backend Locally

```bash
cd server
npm install
npm start
# Should run on http://localhost:4000
```

### 3.2 Start Frontend Locally

```bash
cd client
npm install
npm run dev
# Should run on http://localhost:3000
# Automatically uses VITE_API_URL from .env.development
```

### 3.3 Test API Calls

- Open http://localhost:3000 in browser
- Check browser console (F12)
- Verify API calls show in Network tab
- All requests should go through `http://localhost:4000/api`

## Step 4: Frontend Deployment

### Option A: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from client directory
cd client
vercel

# Follow prompts to connect GitHub
# Select production deployment
```

### Option B: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from client directory
cd client
netlify deploy --prod --dir=dist
```

### Option C: Manual Build and Deploy

```bash
cd client
npm run build
# dist/ folder is your production build

# Upload dist/ to any static hosting:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - GitHub Pages
# - Any web server
```

## Step 5: Production Testing

### 5.1 Build Locally and Test

```bash
cd client
npm run build
npm run preview
# Visit http://localhost:4173
# Verify API calls use Render URL
```

### 5.2 Test Production Deployment

1. Visit your deployed frontend URL
2. Open Developer Console (F12)
3. Check Network tab → XHR
4. Make a request (e.g., load Products page)
5. Verify request URL shows Render backend

Expected URL patterns:
```
https://ravi-maligai.onrender.com/api/products
https://ravi-maligai.onrender.com/api/dashboard/stats
```

### 5.3 Verify Socket Connection

In browser console, you should see:
```
✅ Socket connected: [socket-id]
```

## Step 6: Production Monitoring

### 6.1 Monitor Render Backend

- Logs: https://render.com → your service → Logs
- Watch for:
  - Connection errors
  - CORS issues
  - Database errors
  - API timeouts

### 6.2 Monitor Frontend

- Use browser DevTools
- Check Network tab for failed requests
- Monitor Console for errors
- Test each page functionality

### 6.3 Common Issues & Solutions

**Issue**: CORS errors in browser console
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: 
- Verify CORS is enabled on backend
- Check `origin` array in `server/index.js`
- Add your frontend URL to allowed origins

**Issue**: Socket connection fails
```
WebSocket connection failed
```
**Solution**:
- Verify Socket.io is enabled on backend
- Check `src/socket.js` has correct API_URL
- Verify backend is accessible

**Issue**: API calls return 404
```
/api/products returns 404
```
**Solution**:
- Verify backend URL in `.env.production`
- Check API routes exist on backend
- Verify proxy is not active in production

**Issue**: Slow API responses
**Solution**:
- Check Render's free tier limitations
- Monitor backend CPU/memory usage
- Consider upgrading Render plan

## Step 7: Deployment Checklist

Before going live:

- [ ] Backend deployed on Render with correct URL
- [ ] CORS configured for frontend URL
- [ ] `.env.production` has correct API_URL
- [ ] Local build test successful (`npm run build`)
- [ ] Build preview works (`npm run preview`)
- [ ] All API calls functional in preview
- [ ] Socket.io connections working
- [ ] Database connection successful
- [ ] Environment variables set on Render
- [ ] Frontend deployed to production URL

## Step 8: Continuous Updates

### Updating Backend

```bash
# Push changes to GitHub
git push

# Render auto-deploys from your repository
# Or manually trigger in Render dashboard
```

### Updating Frontend

```bash
# Build and deploy
cd client
npm run build

# If using Vercel: automatic from GitHub
# If using Netlify: automatic from GitHub
# Or upload dist/ folder manually
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (React + Vite)                                  │
│ - Deployed: Vercel/Netlify                              │
│ - URL: https://your-frontend-url.vercel.app             │
│ - Environment: .env.production                           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTPS
                       │ /api/...
                       ↓
┌─────────────────────────────────────────────────────────┐
│ Backend (Node + Express)                                 │
│ - Deployed: Render                                       │
│ - URL: https://ravi-maligai.onrender.com                │
│ - CORS enabled for frontend                             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ MongoDB connection string
                       ↓
┌─────────────────────────────────────────────────────────┐
│ Database (MongoDB Atlas)                                 │
│ - Collection: grocerydb                                 │
│ - Connection: mongodb+srv://username:password@...       │
└─────────────────────────────────────────────────────────┘
```

## Need Help?

### Check These First:

1. **Network Issues**
   - F12 → Network tab → XHR filter
   - Check request URL and response
   - Look for CORS errors

2. **Console Errors**
   - F12 → Console tab
   - Search for red error messages
   - Check API response status

3. **Backend Logs**
   - Render dashboard → Logs
   - Look for connection errors
   - Check API endpoint hits

4. **Environment Variables**
   - Verify `.env.production` content
   - Check Render environment settings
   - Confirm correct API URL format

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-modes.html)
- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Last Updated**: May 1, 2026
**Project**: Ravi Maligai Grocery Management System
