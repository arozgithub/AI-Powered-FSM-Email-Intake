// Vercel Serverless Function for receiving emails from n8n
// Import shared storage module
import { addEmail, updateEmail, getEmails } from './_storage.js';

// Helper function to transform n8n data
function transformN8nEmail(n8nData) {
  const emailData = n8nData.emailData || {};
  const output = n8nData.output || {};
  
  const fromMatch = emailData.From?.match(/^(.+?)\s*<(.+?)>$/) || [];
  const senderName = fromMatch[1]?.trim() || emailData.From || 'Unknown';
  const senderEmail = fromMatch[2]?.trim() || emailData.From || '';
  
  let status = 'Unprocessed';
  if (output.classification === 'JUNK') {
    status = 'Junk';
  } else if (output.classification === 'INCOMPLETE') {
    status = 'Waiting for Customer';
  } else if (output.classification === 'VALID') {
    status = 'Query Logged';
  }
  
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

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      console.log('📧 Received email from n8n:', {
        subject: req.body.emailData?.Subject,
        classification: req.body.output?.classification
      });
      
      const transformedEmail = transformN8nEmail(req.body);
      
      // Check if email already exists
      const existingEmails = getEmails();
      const existingIndex = existingEmails.findIndex(e => e.id === transformedEmail.id);
      
      if (existingIndex >= 0) {
        updateEmail(transformedEmail);
        console.log('✅ Updated existing email:', transformedEmail.id);
      } else {
        addEmail(transformedEmail);
        console.log('✅ Added new email:', transformedEmail.id);
      }
      
      res.status(200).json({ 
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
