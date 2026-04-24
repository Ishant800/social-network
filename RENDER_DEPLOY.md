# Render Deployment Guide

## Step 1: Deploy Backend

### 1.1 Push Code to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 1.2 Create Backend Service on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `social-backend` (or any name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Environment**: `Docker`
   - **Plan**: `Free`

5. Add Environment Variables (click "Advanced"):
   ```
   PORT=5000
   CNS=mongodb+srv://username:password@cluster.mongodb.net/socialnetwork
   SECRETE_KEY=your_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLIENT_ORIGIN=*
   ```

6. Click **"Create Web Service"**

7. Wait for deployment (5-10 minutes)

8. **Copy your backend URL**: `https://social-backend-xxxx.onrender.com`

---

## Step 2: Deploy Frontend

### 2.1 Update Frontend API URL

Edit `client/.env`:
```env
VITE_API_URL=https://social-backend-xxxx.onrender.com
```

Replace with your actual backend URL from Step 1.8

### 2.2 Update Socket.io URL

The Messagebox component already handles this automatically using `VITE_API_URL`.

### 2.3 Commit Changes
```bash
git add client/.env
git commit -m "Update API URL for production"
git push origin main
```

### 2.4 Create Frontend Service on Render

1. Go to Render dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `social-frontend`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. Click **"Create Static Site"**

6. Wait for deployment (3-5 minutes)

7. **Your app is live!** `https://social-frontend-xxxx.onrender.com`

---

## Step 3: Update Backend CORS

After frontend is deployed, update backend environment variable:

1. Go to backend service on Render
2. Go to **Environment** tab
3. Update `CLIENT_ORIGIN`:
   ```
   CLIENT_ORIGIN=https://social-frontend-xxxx.onrender.com
   ```
4. Save changes (backend will auto-redeploy)

---

## Important Notes

### Free Tier Limitations
- Backend spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (enough for one service)

### MongoDB Atlas Setup
1. Go to MongoDB Atlas
2. Network Access → Add IP: `0.0.0.0/0` (allow all)
3. This allows Render to connect

### Troubleshooting

**Backend not starting:**
- Check logs in Render dashboard
- Verify MongoDB connection string
- Ensure all environment variables are set

**Frontend can't reach backend:**
- Check `VITE_API_URL` in client/.env
- Verify backend is running
- Check browser console for CORS errors

**Socket.io not connecting:**
- Verify `VITE_API_URL` is correct
- Check backend logs for WebSocket errors
- Ensure `CLIENT_ORIGIN` includes frontend URL

---

## URLs Summary

After deployment, you'll have:
- **Backend API**: `https://social-backend-xxxx.onrender.com`
- **Frontend App**: `https://social-frontend-xxxx.onrender.com`

---

## Testing Deployment

1. Open frontend URL
2. Register a new account
3. Create a post with image
4. Test messaging
5. Check notifications

---

## Updating After Deployment

### Update Backend:
```bash
# Make changes in server/
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys
```

### Update Frontend:
```bash
# Make changes in client/
git add .
git commit -m "Update frontend"
git push origin main
# Render auto-deploys
```

---

## Cost

- **Free Plan**: $0/month
  - Backend: 1 service
  - Frontend: 1 static site
  - MongoDB Atlas: Free tier (512MB)
  - Cloudinary: Free tier (25GB)

**Total: $0/month** ✅

---

That's it! Simple deployment with Render.
