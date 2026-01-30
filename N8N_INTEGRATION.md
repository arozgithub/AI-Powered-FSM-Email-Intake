# n8n Integration Guide

This document explains how to integrate the FSM Email Intake UI with your n8n workflow.

## Overview

The system consists of two main components:
1. **n8n Workflow**: Processes emails from Gmail and classifies them using AI
2. **React UI**: Displays emails and their processing status

## n8n Workflow Setup

### Import the Workflow

1. Open n8n
2. Click on **Workflows** > **Add Workflow**
3. Click **⋮** menu > **Import from File**
4. Import the `AI-Powered FSM Email Intake (2).json` file

### Configure Required Nodes

#### 1. Gmail Trigger
- **Purpose**: Polls Gmail for new emails
- **Configuration**:
  - Connect your Gmail account via OAuth2
  - Set polling interval (default: every minute)
  - Optional: Add filters to only process specific emails

#### 2. FSM Email Intake Agent
- **Purpose**: AI classification of incoming emails
- **Configuration**:
  - Already configured with the correct system prompt
  - Uses OpenAI GPT-4o-mini model
  - Returns structured JSON output

#### 3. Send to Website (HTTP Request nodes)
- **Purpose**: Send processed emails to your React app
- **Configure BOTH HTTP Request nodes**:

**Node: "Send to Website"** (for all classifications):
```
URL: http://localhost:3001/api/emails
Method: POST
```

**Node: "Send Valid Request to Website"** (for valid requests):
```
URL: http://localhost:3001/api/valid-requests
Method: POST
```

### Create Email Storage Endpoint

You need to create a backend API or additional n8n workflow to:
1. Receive emails from the workflow via HTTP Request nodes
2. Store them in a database (or in-memory for testing)
3. Expose a GET endpoint that the React app can call

#### Option 1: Simple n8n Workflow for Email Storage

Create a new n8n workflow:

**Workflow: Email Storage API**

1. **Webhook (POST)**: `/api/emails`
   - Receives email data from main workflow
   - Stores in a database or Google Sheets

2. **Webhook (GET)**: `/webhook/get-emails`
   - Returns stored emails in this format:
   ```json
   {
     "emails": [
       {
         "id": "unique-id",
         "senderName": "John Doe",
         "senderEmail": "john@example.com",
         "subject": "Subject line",
         "receivedAt": "2026-01-30T08:23:00",
         "status": "Unprocessed",
         "body": "Email body text"
       }
     ]
   }
   ```

#### Option 2: Simple Backend API (Node.js/Express)

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage (use database in production)
let emails = [];

// Receive emails from n8n
app.post('/api/emails', (req, res) => {
  const email = {
    id: Date.now().toString(),
    ...req.body,
    status: 'Unprocessed'
  };
  emails.push(email);
  res.json({ success: true, id: email.id });
});

// Get emails for React app
app.get('/webhook/get-emails', (req, res) => {
  res.json({ emails });
});

app.listen(3001, () => {
  console.log('Email API running on port 3001');
});
```

Run with:
```bash
npm install express cors
node server.js
```

## Testing the Integration

### 1. Test Email Classification (Manual)

Use the webhook endpoint to test classification:

```bash
curl -X POST http://localhost:5678/webhook/test-email-classification \
  -H "Content-Type: application/json" \
  -d '{
    "From": "john@example.com",
    "Subject": "Elevator stuck",
    "snippet": "Our Otis elevator is stuck on floor 5 at 123 Main St, London. Urgent!"
  }'
```

Expected response:
```json
{
  "classification": "VALID",
  "shouldReply": false,
  "replyMessage": "",
  "extractedQuery": {
    "customerName": "john@example.com",
    "customerEmail": "john@example.com",
    "serviceType": "Repair",
    "elevatorBrand": "Otis",
    "buildingType": "",
    "address": "123 Main St, London",
    "urgency": "Urgent",
    "description": "Elevator stuck on floor 5"
  }
}
```

### 2. Test Email Flow End-to-End

1. **Send a test email** to your Gmail account
2. **Wait for n8n** to poll and process it (check interval)
3. **Check n8n execution** log to see processing
4. **Verify email** appears in React UI after clicking "Refresh Emails"

## React App Configuration

### Environment Variables

Update `.env` file:

```env
# n8n webhook for email classification
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/test-email-classification

# API endpoint to fetch emails
VITE_EMAIL_API_URL=http://localhost:3001/webhook/get-emails

# Set to false to use real n8n
VITE_USE_MOCK=false
```

### Start the React App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Data Flow

```
Gmail → n8n Gmail Trigger
         ↓
      AI Classification
         ↓
   ┌─────┴─────┬─────────┬─────────┐
   ↓           ↓         ↓         ↓
 JUNK    INCOMPLETE   VALID    Send to Website
   ↓           ↓         ↓         ↓
No Action  Reply Sent  Logged   Backend API
                                   ↓
                              Store Email
                                   ↓
                        React App Fetches ←
                                   ↓
                           Display in UI
```

## Expected Data Formats

### Email Object (from backend to React)

```typescript
{
  id: string;                    // Unique identifier
  senderName: string;            // Email sender name
  senderEmail: string;           // Email sender address
  subject: string;               // Email subject
  receivedAt: string;            // ISO 8601 datetime
  status: 'Unprocessed' | 'Junk' | 'Waiting for Customer' | 'Query Logged';
  body: string;                  // Full email body text
}
```

### Classification Response (from n8n to React)

```typescript
{
  classification: 'JUNK' | 'INCOMPLETE' | 'VALID';
  shouldReply: boolean;
  replyMessage: string;
  extractedQuery: {
    customerName: string;
    customerEmail: string;
    serviceType: string;
    elevatorBrand: string;
    buildingType: string;
    address: string;
    urgency: string;
    description: string;
  } | null;
}
```

## Troubleshooting

### Emails not appearing in UI

1. Check n8n Gmail Trigger is active
2. Verify backend API is running
3. Check browser console for errors
4. Verify CORS is enabled on backend
5. Test backend endpoint manually:
   ```bash
   curl http://localhost:3001/webhook/get-emails
   ```

### Classification not working

1. Check OpenAI API credentials in n8n
2. Verify webhook URL in `.env` matches n8n
3. Test webhook manually with curl
4. Check n8n execution logs

### CORS Errors

Add CORS headers to your n8n webhooks or backend:

**For Express:**
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

**For n8n HTTP Request Response:**
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
}
```

## Production Deployment

### Security Considerations

1. **Use HTTPS** for all endpoints
2. **Add authentication** to API endpoints
3. **Validate** incoming data
4. **Rate limit** API calls
5. **Use environment variables** for sensitive data

### Recommended Architecture

```
Gmail 
  ↓
n8n (with Gmail OAuth)
  ↓
Backend API (Node.js/Python/PHP)
  ↓
Database (PostgreSQL/MongoDB)
  ↓
React Frontend (deployed on Vercel/Netlify)
```

### Example Production URLs

```env
VITE_N8N_WEBHOOK_URL=https://n8n.yourcompany.com/webhook/test-email-classification
VITE_EMAIL_API_URL=https://api.yourcompany.com/emails
VITE_USE_MOCK=false
```

## Support

For issues:
- Check n8n execution logs
- Review browser console errors
- Verify all environment variables
- Test each component separately

---

**Happy automating! 🚀**
