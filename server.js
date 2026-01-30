const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for React app
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// In-memory email storage (use database in production)
let emails = [];

// Helper function to transform n8n data to React app format
function transformN8nEmail(n8nData) {
  const emailData = n8nData.emailData || {};
  const output = n8nData.output || {};
  
  // Extract sender name from "From" field (format: "Name <email@example.com>")
  const fromMatch = emailData.From?.match(/^(.+?)\s*<(.+?)>$/) || [];
  const senderName = fromMatch[1]?.trim() || emailData.From || 'Unknown';
  const senderEmail = fromMatch[2]?.trim() || emailData.From || '';
  
  // Map classification to status
  let status = 'Unprocessed';
  if (output.classification === 'JUNK') {
    status = 'Junk';
  } else if (output.classification === 'INCOMPLETE') {
    status = 'Waiting for Customer';
  } else if (output.classification === 'VALID') {
    status = 'Query Logged';
  }
  
  // Convert Gmail internalDate (milliseconds) to ISO string
  const receivedAt = emailData.internalDate 
    ? new Date(parseInt(emailData.internalDate)).toISOString()
    : new Date().toISOString();
  
  return {
    id: emailData.id || Date.now().toString(),
    senderName,
    senderEmail,
    subject: emailData.Subject || 'No Subject',
    receivedAt,
    status,
    body: emailData.snippet || '',
    classification: output.classification,
    extractedQuery: output.extractedQuery,
    shouldReply: output.shouldReply,
    replyMessage: output.replyMessage,
    threadId: emailData.threadId
  };
}

// Webhook endpoint to receive emails from n8n
app.post('/api/webhook', (req, res) => {
  try {
    console.log('📧 Received email from n8n:', {
      subject: req.body.emailData?.Subject,
      classification: req.body.output?.classification
    });
    
    const transformedEmail = transformN8nEmail(req.body);
    
    // Check if email already exists (prevent duplicates)
    const existingIndex = emails.findIndex(e => e.id === transformedEmail.id);
    if (existingIndex >= 0) {
      // Update existing email
      emails[existingIndex] = transformedEmail;
      console.log('✅ Updated existing email:', transformedEmail.id);
    } else {
      // Add new email
      emails.unshift(transformedEmail); // Add to beginning for newest first
      console.log('✅ Added new email:', transformedEmail.id);
    }
    
    // Keep only last 100 emails
    if (emails.length > 100) {
      emails = emails.slice(0, 100);
    }
    
    res.json({ 
      success: true, 
      id: transformedEmail.id,
      message: 'Email received and stored'
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint for React app to fetch emails
app.get('/webhook/get-emails', (req, res) => {
  console.log(`📬 Fetching ${emails.length} emails for React app`);
  res.json({ emails });
});

// Get single email by ID
app.get('/webhook/get-emails/:id', (req, res) => {
  const email = emails.find(e => e.id === req.params.id);
  if (email) {
    res.json(email);
  } else {
    res.status(404).json({ error: 'Email not found' });
  }
});

// Delete all emails (for testing)
app.delete('/api/emails/clear', (req, res) => {
  const count = emails.length;
  emails = [];
  console.log(`🗑️  Cleared ${count} emails`);
  res.json({ success: true, cleared: count });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    emailCount: emails.length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  🚀 FSM Email Intake Backend Server                   ║
╠════════════════════════════════════════════════════════╣
║  📡 Server running on: http://localhost:${PORT}        ║
║  📧 Webhook endpoint:  http://localhost:${PORT}/api/webhook
║  📬 Email API:         http://localhost:${PORT}/webhook/get-emails
║  ❤️  Health check:      http://localhost:${PORT}/health
╠════════════════════════════════════════════════════════╣
║  Configure n8n to send emails to:                     ║
║  http://localhost:${PORT}/api/webhook                  ║
╚════════════════════════════════════════════════════════╝
  `);
  console.log('📊 Stored emails:', emails.length);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});
