// Upstash Redis storage for Vercel serverless functions
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: 'https://included-skink-37154.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'AZEiAAIncDE0YjI5ZmYzZmQzM2M0ZGNjOTkxN2Y5NjUyMGM4ZDgxZHAxMzcxNTQ'
});

const EMAILS_KEY = 'fsm-emails';

async function getEmails() {
  try {
    const emails = await redis.get(EMAILS_KEY);
    return emails || [];
  } catch (error) {
    console.error('Error getting emails from Redis:', error);
    return [];
  }
}

async function addEmail(email) {
  try {
    const emails = await getEmails();
    emails.unshift(email);
    
    // Keep only last 100 emails
    if (emails.length > 100) {
      emails.length = 100;
    }
    
    await redis.set(EMAILS_KEY, emails);
    return email;
  } catch (error) {
    console.error('Error adding email to Redis:', error);
    throw error;
  }
}

async function updateEmail(email) {
  try {
    const emails = await getEmails();
    const index = emails.findIndex(e => e.id === email.id);
    
    if (index >= 0) {
      emails[index] = email;
    } else {
      emails.unshift(email);
    }
    
    await redis.set(EMAILS_KEY, emails);
    return email;
  } catch (error) {
    console.error('Error updating email in Redis:', error);
    throw error;
  }
}

async function clearEmails() {
  try {
    await redis.del(EMAILS_KEY);
  } catch (error) {
    console.error('Error clearing emails from Redis:', error);
    throw error;
  }
}

async function deleteEmail(emailId) {
  try {
    const emails = await getEmails();
    const filteredEmails = emails.filter(e => e.id !== emailId);
    
    if (emails.length === filteredEmails.length) {
      return null; // Email not found
    }
    
    await redis.set(EMAILS_KEY, filteredEmails);
    return emailId;
  } catch (error) {
    console.error('Error deleting email from Redis:', error);
    throw error;
  }
}

module.exports = {
  getEmails,
  addEmail,
  updateEmail,
  clearEmails,
  deleteEmail
};
