# Quick Start Guide

## ✅ Setup Complete!

Your FSM Email Intake System is configured and ready to receive emails from n8n.

## 🚀 Running the Application

You'll need **3 terminals** running simultaneously:

### Terminal 1: Backend Server (Port 3000)

```bash
npm run server
```

This starts the Express server that receives emails from n8n.

### Terminal 2: ngrok Tunnel (Exposes localhost to n8n)

```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### Terminal 3: React App (Port 5173)

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

---

**Alternative (without ngrok):** If your backend is deployed to a cloud service, you only need Terminals 1 and 3.

## 📧 n8n Configuration

### Option 1: Using ngrok (Recommended for Development)

**ngrok** creates a secure tunnel to expose your local backend to n8n cloud.

1. **Install ngrok**: Download from https://ngrok.com/download

2. **Sign up** and get your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken

3. **Configure ngrok**:
   ```powershell
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

4. **Start ngrok tunnel** (in a new terminal):
   ```powershell
   ngrok http 3000
   ```

5. **Copy the HTTPS URL** shown (e.g., `https://abc123.ngrok-free.app`)

6. **Update n8n workflow**:
   - Find the **"Send to Website"** HTTP Request node
   - Update URL to: `https://abc123.ngrok-free.app/api/webhook`
   - Save and activate workflow

See [NGROK_SETUP.md](NGROK_SETUP.md) for detailed instructions.

### Option 2: Deploy to Cloud (Production)

Deploy your backend to a cloud service (Heroku, Railway, Vercel, etc.) and use the public URL in n8n.

### Update Your n8n Workflow

1. Open your n8n workflow: "AI-Powered FSM Email Intake"

2. Find the **"Send to Website"** node (HTTP Request)

3. Update the URL to:
   ```
   http://localhost:3000/api/webhook
   ```

4. Save and activate the workflow

### Test the Integration

Send a test email to your Gmail account or use the webhook trigger:

```bash
curl -X POST https://jldev.app.n8n.cloud/webhook/test-email-classification \
  -H "Content-Type: application/json" \
  -d '{
    "From": "John Doe <john@example.com>",
    "Subject": "Elevator stuck on floor 5",
    "snippet": "Our Otis elevator is stuck at 123 Main St, London. Emergency!"
  }'
```

## 📊 How It Works

```
Gmail → n8n Workflow → Classification (AI) → Backend Server → React UI
                                                    ↓
                                           Stores in memory
                                                    ↓
                                    React app fetches and displays
```

## 🎯 Features Available

- ✅ Real-time email fetching from n8n
- ✅ AI-powered classification (JUNK/INCOMPLETE/VALID)
- ✅ Automatic data extraction
- ✅ Service request logging
- ✅ Manual refresh button
- ✅ Error handling and loading states

## 🔧 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `http://localhost:3000/api/webhook` | POST | Receives emails from n8n |
| `http://localhost:3000/webhook/get-emails` | GET | Returns emails to React app |
| `http://localhost:3000/health` | GET | Health check |
| `http://localhost:3000/api/emails/clear` | DELETE | Clear all emails |

## 📝 Environment Variables

Current configuration (`.env`):

```env
VITE_N8N_WEBHOOK_URL=https://jldev.app.n8n.cloud/webhook/test-email-classification
VITE_EMAIL_API_URL=http://localhost:3000/webhook/get-emails
VITE_USE_MOCK=false
```

## 🧪 Testing

### Test the Backend

```bash
# Check health
curl http://localhost:3000/health

# Check emails
curl http://localhost:3000/webhook/get-emails

# Send test email
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "emailData": {
      "id": "test123",
      "Subject": "Test Email",
      "From": "Test <test@example.com>",
      "snippet": "Test body",
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
        "address": "123 Test St"
      }
    }
  }'
```

### Test the React App

1. Open http://localhost:5173
2. Click "Refresh Emails" button
3. Emails from backend should appear in the inbox
4. Click an email to view details
5. Watch AI processing in the right panel

## 🎨 UI Features

- **Left Panel**: Email inbox with status indicators
- **Center Panel**: Email details or query confirmation
- **Right Panel**: AI processing steps and classification
- **Refresh Button**: Manually fetch new emails

## 🐛 Troubleshooting

### No emails appearing?

1. Check backend is running: http://localhost:3000/health
2. Check n8n workflow is activated
3. Verify n8n webhook URL points to `http://localhost:3000/api/webhook`
4. Check browser console for errors
5. Click "Refresh Emails" button

### CORS errors?

- Backend server already has CORS enabled for `http://localhost:5173`
- If using different port, update `server.js` cors origin

### Port already in use?

- Backend: Change PORT in `server.js`
- Frontend: Change port in `vite.config.ts`

## 📦 Data Format

### Email Object (Backend stores this):

```typescript
{
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  receivedAt: string; // ISO 8601
  status: 'Unprocessed' | 'Junk' | 'Waiting for Customer' | 'Query Logged';
  body: string;
  classification: 'JUNK' | 'INCOMPLETE' | 'VALID';
  extractedQuery: {...};
  shouldReply: boolean;
  replyMessage: string;
}
```

## 🚀 Next Steps

1. Send test emails to your Gmail
2. Watch them appear in the UI
3. Click to see AI classification
4. Review extracted service data
5. For production, replace in-memory storage with a database

## 📚 Additional Documentation

- [N8N_INTEGRATION.md](N8N_INTEGRATION.md) - Detailed n8n setup
- [README.md](README.md) - Full project documentation

---

**🎉 You're all set! Start receiving and processing emails!**
