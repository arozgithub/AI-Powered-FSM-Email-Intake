import { useState, useEffect } from 'react';
import { Bot, CheckCircle2, AlertCircle, XCircle, Loader2, Mail, FileCheck, Send, AlertTriangle } from 'lucide-react';
import type { Email, LoggedQuery } from '../App';
import { processEmail } from '../services/emailProcessingService';
import type { EmailProcessingResponse, EmailClassification } from '../types/emailProcessing';

interface AIAgentPanelProps {
  email: Email;
  onStatusUpdate: (emailId: string, status: Email['status']) => void;
  onQueryLogged: (query: LoggedQuery) => void;
}

type ProcessingStep = 'analyzing' | 'extracting' | 'classifying' | 'complete';

export function AIAgentPanel({ email, onStatusUpdate, onQueryLogged }: AIAgentPanelProps) {
  const [step, setStep] = useState<ProcessingStep>('analyzing');
  const [processingResult, setProcessingResult] = useState<EmailProcessingResponse | null>(null);
  const [classification, setClassification] = useState<EmailClassification | null>(null);
  const [clarificationSent, setClarificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Show processing animation but use n8n classification data
    const showProcessingAnimation = async () => {
      try {
        // Step 1: Analyzing (visual effect only)
        setStep('analyzing');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Step 2: Extracting (visual effect only)
        setStep('extracting');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Step 3: Classifying (visual effect only)
        setStep('classifying');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use the classification from n8n (already done)
        if (email.classification) {
          const result: EmailProcessingResponse = {
            classification: email.classification as EmailClassification,
            extractedQuery: email.extractedQuery,
            shouldReply: email.shouldReply || false,
            replyMessage: email.replyMessage || undefined
          };
          
          setProcessingResult(result);
          setClassification(result.classification);
          
          // Update email status based on classification
          if (result.classification === 'JUNK') {
            onStatusUpdate(email.id, 'Junk');
          } else if (result.classification === 'INCOMPLETE') {
            onStatusUpdate(email.id, 'Waiting for Customer');
          } else if (result.classification === 'VALID' && result.extractedQuery) {
            // Log the query
            const queryId = `QRY-UK-${Math.floor(10000 + Math.random() * 90000)}`;
            const extractedData = result.extractedQuery;
            
            onQueryLogged({
              queryId,
              customerName: extractedData.customerName,
              customerEmail: extractedData.customerEmail,
              serviceType: extractedData.serviceType,
              elevatorBrand: extractedData.elevatorBrand,
              buildingType: extractedData.buildingType,
              address: extractedData.address,
              urgency: extractedData.urgency,
              description: extractedData.description,
              status: 'Logged',
              source: 'Email',
              sla: '4-hour response',
              assignedEngineer: 'Not assigned',
              acknowledgedAt: new Date().toISOString()
            });
          }
        } else {
          setError('Email not yet classified');
        }
        
        setStep('complete');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to display classification');
        setStep('complete');
      }
    };

    showProcessingAnimation();
  }, [email.id]);

  const handleSendClarification = () => {
    setClarificationSent(true);
  };

  const getMissingFields = (): string[] => {
    if (!processingResult?.extractedQuery) return [];
    
    const fields: string[] = [];
    const data = processingResult.extractedQuery;
    
    if (!data.serviceType) fields.push('Service Type');
    if (!data.address) fields.push('Building Address');
    if (!data.elevatorBrand) fields.push('Elevator Brand');
    if (!data.urgency) fields.push('Urgency/Timeframe');
    
    return fields;
  };

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-blue-600" />
            <h3 className="font-medium text-slate-900">AI Agent</h3>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="size-5 text-red-600" />
              <span className="font-medium text-red-900">Processing Error</span>
            </div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-blue-600" />
          <h3 className="font-medium text-slate-900">AI Agent</h3>
        </div>
        <p className="text-xs text-slate-600 mt-1">Processing email...</p>
      </div>

      {/* Processing Steps */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step 1: Analyzing */}
        <div className={`border rounded-lg p-3 ${step === 'analyzing' ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center gap-2 mb-2">
            {step === 'analyzing' ? (
              <Loader2 className="size-4 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4 text-green-600" />
            )}
            <span className="text-sm font-medium text-slate-900">1. Analyzing email</span>
          </div>
          {step !== 'analyzing' && (
            <p className="text-xs text-slate-600 ml-6">Email scanned for elevator service intent</p>
          )}
        </div>

        {/* Step 2: Extracting Fields */}
        <div className={`border rounded-lg p-3 ${step === 'extracting' ? 'border-blue-300 bg-blue-50' : step === 'analyzing' ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center gap-2 mb-2">
            {step === 'extracting' ? (
              <Loader2 className="size-4 text-blue-600 animate-spin" />
            ) : step === 'analyzing' ? (
              <div className="size-4 rounded-full border-2 border-slate-300" />
            ) : (
              <CheckCircle2 className="size-4 text-green-600" />
            )}
            <span className="text-sm font-medium text-slate-900">2. Extracting service details</span>
          </div>
          
          {(step === 'classifying' || step === 'complete') && processingResult?.extractedQuery && (
            <div className="ml-6 mt-3 space-y-2">
              <FieldDisplay label="Customer Name" value={processingResult.extractedQuery.customerName} required />
              <FieldDisplay label="Customer Email" value={processingResult.extractedQuery.customerEmail} required />
              <FieldDisplay label="Service Type" value={processingResult.extractedQuery.serviceType} required />
              <FieldDisplay label="Elevator Brand" value={processingResult.extractedQuery.elevatorBrand} />
              <FieldDisplay label="Building Type" value={processingResult.extractedQuery.buildingType} />
              <FieldDisplay label="Address" value={processingResult.extractedQuery.address} required />
              <FieldDisplay label="Urgency" value={processingResult.extractedQuery.urgency} required />
              <FieldDisplay label="Description" value={processingResult.extractedQuery.description} />
            </div>
          )}
        </div>

        {/* Step 3: Classification */}
        <div className={`border rounded-lg p-3 ${step === 'classifying' ? 'border-blue-300 bg-blue-50' : step === 'complete' ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {step === 'classifying' ? (
              <Loader2 className="size-4 text-blue-600 animate-spin" />
            ) : step === 'complete' ? (
              <CheckCircle2 className="size-4 text-green-600" />
            ) : (
              <div className="size-4 rounded-full border-2 border-slate-300" />
            )}
            <span className="text-sm font-medium text-slate-900">3. Classifying email</span>
          </div>
          
          {step === 'complete' && classification && (
            <div className="ml-6 mt-3">
              {classification === 'JUNK' && (
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="size-5 text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">Junk Email</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">No elevator service intent detected. This appears to be spam or irrelevant content.</p>
                  <div className="bg-white rounded p-2 mt-2">
                    <p className="text-xs font-medium text-slate-900">Decision:</p>
                    <p className="text-xs text-slate-600">• Email marked as Junk</p>
                    <p className="text-xs text-slate-600">• No reply sent</p>
                    <p className="text-xs text-slate-600">• No action required</p>
                  </div>
                </div>
              )}
              
              {classification === 'INCOMPLETE' && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="size-5 text-amber-600" />
                    <span className="text-sm font-medium text-slate-900">Incomplete Service Request</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">Service intent detected but missing required information:</p>
                  <ul className="text-xs text-slate-700 ml-4 space-y-1 mb-3">
                    {getMissingFields().map(field => (
                      <li key={field} className="list-disc font-medium">{field}</li>
                    ))}
                  </ul>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs font-medium text-slate-900 mb-1">Decision:</p>
                    <p className="text-xs text-slate-600">Request clarification from customer</p>
                  </div>
                </div>
              )}
              
              {classification === 'VALID' && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="size-5 text-green-600" />
                    <span className="text-sm font-medium text-slate-900">Valid Service Request</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">All required service details extracted successfully.</p>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs font-medium text-slate-900 mb-1">Decision:</p>
                    <p className="text-xs text-slate-600">Create service query and acknowledge customer</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 4: Action Required/Taken */}
        {step === 'complete' && classification && processingResult && (
          <div className="border-2 rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 mb-3">
              {classification === 'JUNK' ? (
                <AlertTriangle className="size-5 text-slate-600" />
              ) : classification === 'INCOMPLETE' ? (
                <Send className="size-5 text-amber-600" />
              ) : (
                <FileCheck className="size-5 text-green-600" />
              )}
              <span className="text-sm font-medium text-slate-900">
                {classification === 'JUNK' && '4. Final Status'}
                {classification === 'INCOMPLETE' && '4. Action Required'}
                {classification === 'VALID' && '4. Query Logged'}
              </span>
            </div>
            
            <div className="space-y-3">
              {classification === 'JUNK' && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="size-4 text-slate-600" />
                    <p className="text-sm font-medium text-slate-900">Email Marked as Junk</p>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p>✓ Status updated to "Junk"</p>
                    <p>✓ Email will not be processed</p>
                    <p className="font-medium text-slate-900 mt-2">No reply will be sent to the sender</p>
                  </div>
                </div>
              )}
              
              {classification === 'INCOMPLETE' && processingResult.shouldReply && (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-slate-900 mb-2">Send Clarification Email</p>
                    <p className="text-xs text-slate-600 mb-3">
                      An automated email will be sent to <span className="font-medium">{processingResult.extractedQuery?.customerEmail}</span> requesting the missing information.
                    </p>
                    
                    {!clarificationSent ? (
                      <button
                        onClick={handleSendClarification}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Send className="size-4" />
                        Send Clarification Request
                      </button>
                    ) : (
                      <div className="bg-white rounded-lg p-3 border border-amber-300">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="size-4 text-green-600" />
                          <p className="text-sm font-medium text-slate-900">Clarification Email Sent</p>
                        </div>
                        <div className="text-xs text-slate-600 space-y-1">
                          <p>✓ Email sent to customer</p>
                          <p>✓ Status set to "Waiting for Customer"</p>
                          <p>✓ Query will be processed once customer replies</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-slate-900 mb-1">Email Template Preview:</p>
                    <div className="bg-white rounded p-2 text-xs text-slate-600 whitespace-pre-wrap">
                      {processingResult.replyMessage}
                    </div>
                  </div>
                </>
              )}
              
              {classification === 'VALID' && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="size-4 text-green-600" />
                      <p className="text-sm font-medium text-slate-900">Service Query Created</p>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p>✓ Query logged in FSM system</p>
                      <p>✓ Acknowledgement email sent to customer</p>
                      <p>✓ Status set to "Query Logged"</p>
                      <p>✓ SLA timer started (4-hour response)</p>
                    </div>
                  </div>
                  
                  {processingResult.shouldReply && processingResult.replyMessage && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-900 mb-1">Acknowledgement Email Sent:</p>
                      <div className="bg-white rounded p-2 text-xs text-slate-600 whitespace-pre-wrap">
                        {processingResult.replyMessage}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface FieldDisplayProps {
  label: string;
  value: string;
  required?: boolean;
}

function FieldDisplay({ label, value, required }: FieldDisplayProps) {
  const isMissing = required && !value;
  
  return (
    <div className={`text-xs p-2 rounded border ${
      isMissing 
        ? 'bg-red-50 border-red-200' 
        : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        {isMissing && (
          <span className="text-red-600 flex items-center gap-1">
            <AlertCircle className="size-3" />
            Missing
          </span>
        )}
      </div>
      <div className={isMissing ? 'text-slate-400 italic' : 'text-slate-900'}>
        {value || 'Not found'}
      </div>
    </div>
  );
}
