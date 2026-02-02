import type { Email } from '../App';

// Configuration
const API_BASE_URL = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3000';
const API_ENDPOINT = `${API_BASE_URL}/api/get-emails`;

export interface FetchEmailsResponse {
  emails: Email[];
}

/**
 * Fetch emails from the backend/n8n
 * This endpoint should return processed emails from Gmail
 */
export async function fetchEmails(): Promise<Email[]> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.statusText}`);
    }

    const data: FetchEmailsResponse = await response.json();
    return data.emails || [];
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

/**
 * Fetch a single email by ID
 */
export async function fetchEmailById(emailId: string): Promise<Email | null> {
  try {
    const response = await fetch(`${API_ENDPOINT}/${emailId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch email: ${response.statusText}`);
    }

    const email: Email = await response.json();
    return email;
  } catch (error) {
    console.error('Error fetching email:', error);
    return null;
  }
}
