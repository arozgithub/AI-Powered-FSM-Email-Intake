# Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- [Vercel Account](https://vercel.com/signup) (free)
- [Vercel CLI](https://vercel.com/docs/cli) installed (optional)

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - FSM Email Intake"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Configure Project**
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`

6. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_N8N_WEBHOOK_URL=https://jldev.app.n8n.cloud/webhook/test-email-classification
   VITE_EMAIL_API_URL=https://your-app.vercel.app/api/get-emails
   VITE_USE_MOCK=false
   ```
   
   ⚠️ **Important**: Replace `your-app` with your actual Vercel deployment URL after first deployment

7. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - You'll get a URL like: `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - What's your project's name? **fsm-email-intake**
   - In which directory is your code located? **./

4. **Add Environment Variables**
   ```bash
   vercel env add VITE_N8N_WEBHOOK_URL
   # Enter: https://jldev.app.n8n.cloud/webhook/test-email-classification
   
   vercel env add VITE_EMAIL_API_URL
   # Enter: https://your-deployment-url.vercel.app/api/get-emails
   
   vercel env add VITE_USE_MOCK
   # Enter: false
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## 🔧 Post-Deployment Configuration

### 1. Update n8n Workflow

After deployment, update your n8n workflow's **"Send to Website"** node:

**Old URL (local):**
```
http://localhost:3000/api/webhook
```

**New URL (production):**
```
https://your-app.vercel.app/api/webhook
```

### 2. Update Environment Variable

Go back to Vercel Dashboard → Your Project → Settings → Environment Variables

Update `VITE_EMAIL_API_URL` to:
```
https://your-app.vercel.app/api/get-emails
```

Then redeploy:
```bash
vercel --prod
```

Or click "Redeploy" in the Vercel dashboard.

## 📁 Project Structure for Vercel

```
AI-Powered FSM Email Intake/
├── api/                    # Serverless functions
│   ├── webhook.js         # POST /api/webhook (receives from n8n)
│   └── get-emails.js      # GET /api/get-emails (serves to React)
├── src/                   # React app source
├── dist/                  # Built React app (generated)
├── vercel.json           # Vercel configuration
├── package.json
└── vite.config.ts
```

## 🔄 API Endpoints (After Deployment)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `https://your-app.vercel.app/api/webhook` | POST | Receives emails from n8n |
| `https://your-app.vercel.app/api/get-emails` | GET | Serves emails to React app |
| `https://your-app.vercel.app/` | GET | React app frontend |

## ⚠️ Important Notes

### Storage Limitation
The current implementation uses **in-memory storage** which resets on each deployment. For production, you should use:

1. **Vercel KV (Recommended)**
   ```bash
   vercel env add KV_REST_API_URL
   vercel env add KV_REST_API_TOKEN
   ```

2. **External Database**
   - MongoDB Atlas
   - PostgreSQL (Neon, Supabase)
   - Firebase

3. **Redis**
   - Upstash Redis
   - Redis Cloud

### Update API Functions for Persistent Storage

If using Vercel KV, update `api/webhook.js`:

```javascript
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const email = transformN8nEmail(req.body);
    
    // Store in Vercel KV
    await kv.lpush('emails', email);
    await kv.ltrim('emails', 0, 99); // Keep last 100
    
    res.status(200).json({ success: true });
  }
}
```

## 🧪 Testing Deployment

1. **Visit your deployed app**
   ```
   https://your-app.vercel.app
   ```

2. **Test webhook endpoint**
   ```bash
   curl -X POST https://your-app.vercel.app/api/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "emailData": {
         "id": "test123",
         "Subject": "Test",
         "From": "Test <test@test.com>",
         "snippet": "Test email"
       },
       "output": {
         "classification": "VALID",
         "extractedQuery": {}
       }
     }'
   ```

3. **Test get-emails endpoint**
   ```bash
   curl https://your-app.vercel.app/api/get-emails
   ```

## 🐛 Troubleshooting

### Emails not appearing?
1. Check Vercel Function logs in dashboard
2. Verify n8n is sending to correct URL
3. Check environment variables are set

### CORS errors?
- Serverless functions already have CORS configured
- If issues persist, check browser console

### Build fails?
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Try building locally: `npm run build`

## 📊 Monitoring

View logs in Vercel Dashboard:
1. Go to your project
2. Click "Deployments"
3. Click on latest deployment
4. View "Functions" tab for API logs

## 🔒 Security (Production Checklist)

- [ ] Add authentication to API endpoints
- [ ] Implement rate limiting
- [ ] Use environment variables for sensitive data
- [ ] Add request validation
- [ ] Use persistent database instead of in-memory storage
- [ ] Enable Vercel Analytics
- [ ] Set up custom domain

## 🎉 You're Live!

Your FSM Email Intake system is now deployed and accessible worldwide!

**Next Steps:**
1. Update n8n webhook URL
2. Configure persistent storage
3. Set up custom domain (optional)
4. Monitor function logs

---

**Deployment URL:** `https://your-app.vercel.app`
