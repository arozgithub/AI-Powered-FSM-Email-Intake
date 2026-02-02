import type { EmailProcessingRequest, EmailProcessingResponse } from '../types/emailProcessing';

// Configuration
const API_ENDPOINT = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/email-intake';

// Mock mode for development without n8n
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_N8N_WEBHOOK_URL;

/**
 * Process an email through the FSM intake workflow
 * This sends the email to the n8n workflow which uses AI to classify and extract data
 */
export async function processEmail(request: EmailProcessingRequest): Promise<EmailProcessingResponse> {
  if (USE_MOCK) {
    // Mock processing for development
    return mockProcessEmail(request);
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderName: request.senderName,
        senderEmail: request.senderEmail,
        subject: request.subject,
        body: request.body,
        receivedAt: request.receivedAt,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data: EmailProcessingResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing email:', error);
    throw error;
  }
}

/**
 * Mock email processing for development without n8n
 * Simulates the AI classification based on email content
 */
function mockProcessEmail(request: EmailProcessingRequest): Promise<EmailProcessingResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const body = request.body.toLowerCase();
      const subject = request.subject.toLowerCase();

      // Check for junk/spam
      if (
        body.includes('seo') ||
        body.includes('marketing') ||
        body.includes('grow your business') ||
        subject.includes('promo') ||
        body.includes('unsubscribe')
      ) {
        resolve({
          classification: 'JUNK',
          shouldReply: false,
          replyMessage: '',
          extractedQuery: null,
        });
        return;
      }

      // Extract information from email
      let extractedQuery = {
        customerName: request.senderName || '',
        customerEmail: request.senderEmail || '',
        serviceType: '',
        elevatorBrand: '',
        buildingType: '',
        address: '',
        urgency: '',
        description: '',
      };

      // Extract service type
      if (body.includes('elevator') || subject.includes('elevator')) {
        extractedQuery.serviceType = 'Elevator Maintenance';
      } else if (body.includes('lift') || subject.includes('lift')) {
        extractedQuery.serviceType = 'Lift Service';
      } else if (body.includes('inspection')) {
        extractedQuery.serviceType = 'Inspection';
      } else if (body.includes('repair')) {
        extractedQuery.serviceType = 'Repair';
      } else if (body.includes('maintenance')) {
        extractedQuery.serviceType = 'General Maintenance';
      }

      // Extract elevator brand
      const brands = ['Otis', 'Schindler', 'KONE', 'ThyssenKrupp', 'Mitsubishi'];
      for (const brand of brands) {
        if (body.includes(brand.toLowerCase())) {
          extractedQuery.elevatorBrand = brand;
          break;
        }
      }

      // Extract building type
      if (body.includes('school') || body.includes('academy')) {
        extractedQuery.buildingType = 'Educational';
      } else if (body.includes('office')) {
        extractedQuery.buildingType = 'Commercial Office';
      } else if (body.includes('hospital')) {
        extractedQuery.buildingType = 'Healthcare';
      } else if (body.includes('apartment') || body.includes('residential')) {
        extractedQuery.buildingType = 'Residential';
      }

      // Extract address using regex patterns
      const addressMatch = request.body.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s+[A-Z]\d+\s+\d[A-Z]{2})/);
      if (addressMatch) {
        extractedQuery.address = addressMatch[0];
      }

      // Extract urgency
      if (body.includes('emergency') || body.includes('urgent') || body.includes('asap') || body.includes('today')) {
        extractedQuery.urgency = 'Emergency - Same Day';
      } else if (body.includes('soon') || subject.includes('urgent')) {
        extractedQuery.urgency = 'High Priority';
      } else if (body.includes('next week') || body.includes('schedule')) {
        extractedQuery.urgency = 'Normal';
      }

      // Extract description from subject and body
      extractedQuery.description = request.subject;

      // Determine if complete or incomplete
      const missingFields = [];
      if (!extractedQuery.serviceType) missingFields.push('service type');
      if (!extractedQuery.address) missingFields.push('building address');
      if (!extractedQuery.urgency) missingFields.push('urgency or preferred time');

      if (missingFields.length > 0) {
        const replyMessage = `Dear ${request.senderName},

Thank you for contacting our elevator services team.

To process your service request, we need the following information:
${missingFields.map((field) => `• ${field.charAt(0).toUpperCase() + field.slice(1)}`).join('\n')}

Please reply with these details so we can assist you promptly.

Best regards,
FSM Service Desk`;

        resolve({
          classification: 'INCOMPLETE',
          shouldReply: true,
          replyMessage,
          extractedQuery: {
            ...extractedQuery,
            assetBrand: extractedQuery.elevatorBrand
          },
        });
      } else {
        resolve({
          classification: 'VALID',
          shouldReply: true,
          replyMessage: `Dear ${request.senderName},

Thank you for your service request. We have logged your query and will respond within our 4-hour SLA.

Service Details:
• Service Type: ${extractedQuery.serviceType}
• Location: ${extractedQuery.address}
• Urgency: ${extractedQuery.urgency}

A service engineer will contact you shortly.

Best regards,
FSM Service Desk`,
          extractedQuery: {
            ...extractedQuery,
            assetBrand: extractedQuery.elevatorBrand
          },
        });
      }
    }, 1500); // Simulate API delay
  });
}
