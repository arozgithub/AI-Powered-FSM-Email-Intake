const { getEmails, Redis } = require('./_storage');

const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Email ID is required' });
    }

    // Get current emails
    const emails = await getEmails();
    
    // Filter out the email to delete
    const updatedEmails = emails.filter(email => email.id !== id);

    if (emails.length === updatedEmails.length) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Save updated list
    await redis.set('fsm-emails', JSON.stringify(updatedEmails));

    return res.status(200).json({ 
      success: true, 
      message: 'Email deleted successfully',
      id 
    });
  } catch (error) {
    console.error('Error deleting email:', error);
    return res.status(500).json({ 
      error: 'Failed to delete email',
      details: error.message 
    });
  }
};
