// Vercel Serverless Function for fetching emails
// Note: In production, use Vercel KV, Redis, or external database
// This in-memory storage will reset on each deployment
let emails = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    console.log(`📬 Fetching ${emails.length} emails for React app`);
    res.status(200).json({ emails });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
