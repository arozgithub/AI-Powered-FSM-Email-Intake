# 🚀 Quick Command Reference

## Start All Services (3 Terminals Required)

### 📋 Terminal 1: Backend Server
```powershell
cd "C:\AI-Powered FSM Email Intake"
npm run server
```
✅ **Output:** Server running on http://localhost:3000
📧 **Endpoint:** http://localhost:3000/api/webhook

---

### 📋 Terminal 2: ngrok Tunnel
```powershell
ngrok http 3000
```
✅ **Output:** Forwarding https://abc123.ngrok-free.app -> http://localhost:3000

🔗 **Copy this URL** and use it in n8n!

---

### 📋 Terminal 3: React App
```powershell
cd "C:\AI-Powered FSM Email Intake"
npm run dev
```
✅ **Output:** Local: http://localhost:5173/

🌐 **Open:** http://localhost:5173

---

## n8n Configuration

### Update "Send to Website" Node

**Old URL:**
```
http://localhost:3000/api/webhook
```

**New URL (replace with your ngrok URL):**
```
https://abc123.ngrok-free.app/api/webhook
```

⚠️ **Important:** Use YOUR ngrok URL from Terminal 2!

---

## Testing Commands

### Test Backend Health
```powershell
curl http://localhost:3000/health
```

### Test ngrok Tunnel
```powershell
curl https://abc123.ngrok-free.app/health
```

### Test Email Reception
```powershell
curl -X POST https://abc123.ngrok-free.app/api/webhook `
  -H "Content-Type: application/json" `
  -d '{
    "emailData": {
      "id": "test123",
      "Subject": "Test Email",
      "From": "Test User <test@example.com>",
      "snippet": "This is a test email",
      "internalDate": "1706630400000"
    },
    "output": {
      "classification": "VALID",
      "shouldReply": false,
      "extractedQuery": {
        "customerName": "Test User",
        "customerEmail": "test@example.com",
        "serviceType": "Maintenance",
        "elevatorBrand": "Otis",
        "buildingType": "Commercial",
        "address": "123 Test Street",
        "urgency": "Normal",
        "description": "Test elevator service request"
      }
    }
  }'
```

Then check React app - email should appear after clicking "Refresh Emails"!

---

## Monitoring URLs

| Service | URL | Purpose |
|---------|-----|---------|
| React App | http://localhost:5173 | Main application UI |
| Backend Health | http://localhost:3000/health | Check backend status |
| ngrok Dashboard | http://localhost:4040 | Monitor incoming requests |
| n8n Workflow | https://jldev.app.n8n.cloud | Your n8n instance |

---

## Troubleshooting

### Backend not starting?
```powershell
# Check if port 3000 is in use
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

# Kill process using port 3000
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

### ngrok not working?
```powershell
# Verify ngrok is installed
ngrok version

# Check if authtoken is configured
ngrok config check

# Add authtoken if missing
ngrok config add-authtoken YOUR_TOKEN
```

### React app not loading?
```powershell
# Check if Vite is running on port 5173
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

# Clear cache and restart
npm run dev
```

---

## Quick Start (All-in-One)

### First Time Setup
```powershell
# 1. Install dependencies
npm install

# 2. Install ngrok (if not installed)
# Download from: https://ngrok.com/download
# Add authtoken: ngrok config add-authtoken YOUR_TOKEN

# 3. Start all services in separate terminals
# Terminal 1: npm run server
# Terminal 2: ngrok http 3000
# Terminal 3: npm run dev

# 4. Update n8n with ngrok URL
# Copy URL from Terminal 2 → Paste in n8n "Send to Website" node
```

### Daily Workflow
```powershell
# Terminal 1
npm run server

# Terminal 2 (new window)
ngrok http 3000

# Terminal 3 (new window)
npm run dev

# Browser
# Open: http://localhost:5173
```

---

## Environment Variables

Current configuration (`.env`):
```env
VITE_N8N_WEBHOOK_URL=https://jldev.app.n8n.cloud/webhook/test-email-classification
VITE_EMAIL_API_URL=http://localhost:3000/webhook/get-emails
VITE_USE_MOCK=false
```

✅ No changes needed! The React app connects to localhost:3000 internally.
✅ Only n8n needs the ngrok URL to send webhooks from the cloud.

---

## File Structure

```
C:\AI-Powered FSM Email Intake\
├── server.js              ← Backend server (port 3000)
├── package.json           ← Dependencies
├── .env                   ← Configuration
├── QUICKSTART.md          ← Getting started guide
├── NGROK_SETUP.md         ← Detailed ngrok instructions
└── src/
    ├── App.tsx            ← Main React app
    ├── services/
    │   ├── emailFetchService.ts      ← Fetches emails from backend
    │   └── emailProcessingService.ts ← Processes emails with n8n
    └── components/        ← UI components
```

---

**Need help?** Check detailed guides:
- 📖 [NGROK_SETUP.md](NGROK_SETUP.md) - Complete ngrok tutorial
- 📖 [QUICKSTART.md](QUICKSTART.md) - Full setup guide
- 📖 [N8N_INTEGRATION.md](N8N_INTEGRATION.md) - n8n workflow details
