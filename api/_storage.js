// Shared in-memory storage for Vercel serverless functions
// ⚠️ WARNING: This will reset on every deployment and cold start!
// For production, use Vercel KV, Redis, or a database

let emails = [];

function getEmails() {
  return emails;
}

function addEmail(email) {
  emails.unshift(email);
  
  // Keep only last 100 emails
  if (emails.length > 100) {
    emails = emails.slice(0, 100);
  }
  
  return email;
}

function updateEmail(email) {
  const index = emails.findIndex(e => e.id === email.id);
  if (index >= 0) {
    emails[index] = email;
  } else {
    addEmail(email);
  }
  return email;
}

function clearEmails() {
  emails = [];
}

module.exports = {
  getEmails,
  addEmail,
  updateEmail,
  clearEmails
};
