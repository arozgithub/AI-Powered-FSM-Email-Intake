// Email Processing Workflow Types

export type EmailClassification = 'JUNK' | 'INCOMPLETE' | 'VALID';

export interface ExtractedQuery {
  customerName: string;
  customerEmail: string;
  serviceType: string;
  elevatorBrand: string;
  buildingType: string;
  address: string;
  urgency: string;
  description: string;
}

export interface EmailProcessingRequest {
  emailId: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  receivedAt: string;
}

export interface EmailProcessingResponse {
  classification: EmailClassification;
  shouldReply: boolean;
  replyMessage: string;
  extractedQuery: ExtractedQuery | null;
}
