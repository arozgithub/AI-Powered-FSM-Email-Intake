# ngrok Setup Guide for FSM Email Intake

## Why ngrok?

ngrok creates a secure tunnel from the public internet to your local development server, allowing your cloud-based n8n instance to send webhooks to your local machine.

## Installation

### Option 1: Download from Website
1. Go to https://ngrok.com/download
2. Download for Windows
3. Extract `ngrok.exe` to a folder (e.g., `C:\ngrok`)
4. Add to PATH or use full path

### Option 2: Using Chocolatey
```powershell
choco install ngrok
```

### Option 3: Using Scoop
```powershell
scoop install ngrok
```

## Setup

### 1. Sign Up (Free)
1. Create account at https://dashboard.ngrok.com/signup
2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken

### 2. Configure ngrok
```powershell
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

## Running ngrok

### Start ngrok tunnel for backend server (Port 3000)

Open a **new terminal** and run:

```powershell
ngrok http 3000
```

You'll see output like:
```
ngrok

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### Your Public URL
Copy the **Forwarding** URL: `https://abc123.ngrok-free.app`

## Update n8n Workflow

### 1. Open n8n Workflow
Navigate to: https://jldev.app.n8n.cloud

### 2. Update "Send to Website" Node

Find the HTTP Request node named **"Send to Website"** and update:

**Before:**
```
http://localhost:3000/api/webhook
```

**After:**
```
https://abc123.ngrok-free.app/api/webhook
```

⚠️ Replace `abc123.ngrok-free.app` with YOUR actual ngrok URL

### 3. Save and Activate Workflow

## Testing the Connection

### 1. Test ngrok URL
```powershell
curl https://abc123.ngrok-free.app/health
```

Expected response:
```json
{
  "status": "ok",
  "emailCount": 0,
  "timestamp": "2026-01-30T..."
}
```

### 2. Test n8n Webhook

Send a test email or use the n8n webhook trigger. You should see:

**In ngrok terminal:**
```
POST /api/webhook              200 OK
```

**In backend server terminal:**
```
📧 Received email from n8n: {
  subject: 'Test Subject',
  classification: 'VALID'
}
✅ Added new email: 19c0eac76bbee3bf
```

**In React app:**
Click "Refresh Emails" - your email should appear!

## Full System Architecture with ngrok

```
Gmail
  ↓
n8n Cloud (https://jldev.app.n8n.cloud)
  ↓
AI Classification
  ↓
HTTP Request to ngrok
  ↓
ngrok Tunnel (https://abc123.ngrok-free.app)
  ↓
Your Local Backend (http://localhost:3000)
  ↓
React App (http://localhost:5173)
```

## Running the Complete System

### Terminal 1: Backend Server
```powershell
npm run server
```
**Port:** 3000
**Status:** ✅ Running

### Terminal 2: ngrok Tunnel
```powershell
ngrok http 3000
```
**Public URL:** https://abc123.ngrok-free.app
**Status:** ✅ Tunnel active

### Terminal 3: React App
```powershell
npm run dev
```
**Port:** 5173
**Status:** ✅ Running

### Open Browser
Navigate to: http://localhost:5173

## Monitoring

### ngrok Web Interface
Open: http://127.0.0.1:4040

Features:
- See all incoming requests in real-time
- Inspect request/response details
- Replay requests for debugging

### Backend Logs
Watch your backend terminal for:
```
📧 Received email from n8n: {...}
✅ Added new email: xxx
📬 Fetching X emails for React app
```

## Troubleshooting

### ngrok URL changes on restart
**Problem:** Each time you restart ngrok, you get a new URL.

**Solution 1 (Free):** Update n8n workflow with new URL each time

**Solution 2 (Paid - $8/month):** Get a static domain:
```powershell
ngrok http 3000 --domain=your-static-domain.ngrok-free.app
```

### n8n can't reach ngrok URL
**Check:**
1. ngrok is running: `ngrok http 3000`
2. Backend server is running: `npm run server`
3. URL in n8n matches ngrok URL exactly
4. Test manually: `curl https://your-ngrok-url.ngrok-free.app/health`

### CORS errors
The backend already has CORS enabled. If you see CORS errors:
1. Check ngrok URL is HTTPS (not HTTP)
2. Ensure backend server is running
3. Check browser console for actual error

### Webhook not receiving data
1. Check ngrok web interface: http://127.0.0.1:4040
2. Verify requests are arriving at ngrok
3. Check backend server logs
4. Verify n8n workflow is activated
5. Test with curl:
```powershell
curl -X POST https://your-ngrok-url.ngrok-free.app/api/webhook `
  -H "Content-Type: application/json" `
  -d '{
    "emailData": {
      "id": "test123",
      "Subject": "Test",
      "From": "Test <test@example.com>",
      "snippet": "Test body",
      "internalDate": "1706630400000"
    },
    "output": {
      "classification": "VALID",
      "shouldReply": false,
      "extractedQuery": {
        "customerName": "Test",
        "customerEmail": "test@example.com",
        "serviceType": "Maintenance",
        "elevatorBrand": "Otis",
        "address": "123 Test St"
      }
    }
  }'
```

## Best Practices

### Development Workflow

1. **Start all services:**
   ```powershell
   # Terminal 1
   npm run server
   
   # Terminal 2
   ngrok http 3000
   
   # Terminal 3
   npm run dev
   ```

2. **Copy ngrok URL**
   From Terminal 2, copy the HTTPS forwarding URL

3. **Update n8n once**
   Paste the ngrok URL into n8n "Send to Website" node

4. **Keep ngrok running**
   Don't close Terminal 2 - URL stays the same while running

5. **Test the flow**
   Send test email or use n8n webhook trigger

### Security Tips

- **Free tier:** ngrok URLs are public but hard to guess
- **Don't commit:** Never commit ngrok URLs to git
- **Use HTTPS:** Always use the HTTPS URL from ngrok
- **Monitor:** Check ngrok web interface for unexpected traffic

## Alternative: Production Deployment

For production, instead of ngrok, deploy to:
- **Heroku** (Free tier available)
- **Railway** (Free tier available)
- **Vercel** (Frontend) + **Railway** (Backend)
- **DigitalOcean** ($5/month)
- **AWS EC2** or **Azure VM**

This eliminates the need for ngrok and provides:
- ✅ Static URLs
- ✅ Better performance
- ✅ No connection limits
- ✅ Professional setup

## Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Backend Server | 3000 | http://localhost:3000 |
| ngrok Tunnel | - | https://abc123.ngrok-free.app |
| ngrok Web UI | 4040 | http://localhost:4040 |
| React App | 5173 | http://localhost:5173 |

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhook` | POST | Receives emails from n8n |
| `/webhook/get-emails` | GET | Returns emails to React |
| `/health` | GET | Health check |

---

**🎉 You're ready to receive emails from n8n!**
