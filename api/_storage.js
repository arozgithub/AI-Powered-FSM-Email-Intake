// Shared in-memory storage for Vercel serverless functions
// ⚠️ WARNING: This will reset on every deployment and cold start!
// For production, use Vercel KV, Redis, or a database

let emails = [];

export function getEmails() {
  return emails;
}

export function addEmail(email) {
  emails.unshift(email);
  
  // Keep only last 100 emails
  if (emails.length > 100) {
    emails = emails.slice(0, 100);
  }
  
  return email;
}

export function updateEmail(email) {
  const index = emails.findIndex(e => e.id === email.id);
  if (index >= 0) {
    emails[index] = email;
  } else {
    addEmail(email);
  }
  return email;
}

export function clearEmails() {
  emails = [];
}
