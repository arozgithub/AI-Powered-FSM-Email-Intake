import { useState, useEffect } from 'react';
import { Bot, CheckCircle2, AlertCircle, XCircle, Loader2, FileCheck, Send, AlertTriangle } from 'lucide-react';
import type { Email, LoggedQuery } from '../App';
import { processEmail } from '../services/emailProcessingService';
import type { EmailProcessingResponse, EmailClassification } from '../types/emailProcessing';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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
              assetBrand: extractedData.assetBrand,
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
    if (!data.assetBrand) fields.push('Asset/Equipment Brand');
    if (!data.urgency) fields.push('Urgency/Timeframe');
    
    return fields;
  };

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border bg-muted">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            <h3 className="font-medium text-foreground">AI Agent</h3>
          </div>
        </div>
        <div className="flex-1 p-4">
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="size-5 text-destructive" />
                <span className="font-medium text-foreground">Processing Error</span>
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-primary" />
          <h3 className="font-medium text-foreground">AI Agent</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Processing email...</p>
      </div>

      {/* Processing Steps */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step 1: Analyzing */}
        <Card className={step === 'analyzing' ? 'border-info bg-info-muted' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              {step === 'analyzing' ? (
                <Loader2 className="size-4 text-info animate-spin" />
              ) : (
                <CheckCircle2 className="size-4 text-success" />
              )}
              <span className="text-sm font-medium text-foreground">1. Analyzing email</span>
            </div>
            {step !== 'analyzing' && (
              <p className="text-xs text-muted-foreground ml-6">Email scanned for service request intent</p>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Extracting Fields */}
        <Card className={step === 'extracting' ? 'border-info bg-info-muted' : step === 'analyzing' ? 'opacity-50' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              {step === 'extracting' ? (
                <Loader2 className="size-4 text-info animate-spin" />
              ) : step === 'analyzing' ? (
                <div className="size-4 rounded-full border-2 border-muted-foreground" />
              ) : (
                <CheckCircle2 className="size-4 text-success" />
              )}
              <span className="text-sm font-medium text-foreground">2. Extracting service details</span>
            </div>
            
            {(step === 'classifying' || step === 'complete') && processingResult?.extractedQuery && (
              <div className="ml-6 mt-3 space-y-2">
                <FieldDisplay label="Customer Name" value={processingResult.extractedQuery.customerName} required />
                <FieldDisplay label="Customer Email" value={processingResult.extractedQuery.customerEmail} required />
                <FieldDisplay label="Service Type" value={processingResult.extractedQuery.serviceType} required />
                <FieldDisplay label="Asset/Equipment Brand" value={processingResult.extractedQuery.assetBrand} />
                <FieldDisplay label="Building Type" value={processingResult.extractedQuery.buildingType} />
                <FieldDisplay label="Address" value={processingResult.extractedQuery.address} required />
                <FieldDisplay label="Urgency" value={processingResult.extractedQuery.urgency} required />
                <FieldDisplay label="Description" value={processingResult.extractedQuery.description} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Classification */}
        <Card className={step === 'classifying' ? 'border-info bg-info-muted' : step === 'complete' ? '' : 'opacity-50'}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              {step === 'classifying' ? (
                <Loader2 className="size-4 text-info animate-spin" />
              ) : step === 'complete' ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : (
                <div className="size-4 rounded-full border-2 border-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">3. Classifying email</span>
            </div>
            
            {step === 'complete' && classification && (
              <div className="ml-6 mt-3">
                {classification === 'JUNK' && (
                  <Card className="bg-muted">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="size-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Junk Email</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">No service intent detected. This appears to be spam or irrelevant content.</p>
                      <div className="bg-background rounded p-2 mt-2">
                        <p className="text-xs font-medium text-foreground">Decision:</p>
                        <p className="text-xs text-muted-foreground">• Email marked as Junk</p>
                        <p className="text-xs text-muted-foreground">• No reply sent</p>
                        <p className="text-xs text-muted-foreground">• No action required</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {classification === 'INCOMPLETE' && (
                  <Card className="border-warning bg-warning-muted">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="size-5 text-warning" />
                        <span className="text-sm font-medium text-foreground">Incomplete Service Request</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Service intent detected but missing required information:</p>
                      <ul className="text-xs text-foreground ml-4 space-y-1 mb-3">
                        {getMissingFields().map(field => (
                          <li key={field} className="list-disc font-medium">{field}</li>
                        ))}
                      </ul>
                      <div className="bg-background rounded p-2">
                        <p className="text-xs font-medium text-foreground mb-1">Decision:</p>
                        <p className="text-xs text-muted-foreground">Request clarification from customer</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {classification === 'VALID' && (
                  <Card className="border-success bg-success-muted">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="size-5 text-success" />
                        <span className="text-sm font-medium text-foreground">Valid Service Request</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">All required service details extracted successfully.</p>
                      <div className="bg-background rounded p-2">
                        <p className="text-xs font-medium text-foreground mb-1">Decision:</p>
                        <p className="text-xs text-muted-foreground">Create service query and acknowledge customer</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 4: Action Required/Taken */}
        {step === 'complete' && classification && processingResult && (
          <Card className="border-2">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                {classification === 'JUNK' ? (
                  <AlertTriangle className="size-5 text-muted-foreground" />
                ) : classification === 'INCOMPLETE' ? (
                  <Send className="size-5 text-warning" />
                ) : (
                  <FileCheck className="size-5 text-success" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {classification === 'JUNK' && '4. Final Status'}
                  {classification === 'INCOMPLETE' && '4. Action Required'}
                  {classification === 'VALID' && '4. Query Logged'}
                </span>
              </div>
              
              <div className="space-y-3">
                {classification === 'JUNK' && (
                  <Card className="bg-muted">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="size-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Email Marked as Junk</p>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>✓ Status updated to "Junk"</p>
                        <p>✓ Email will not be processed</p>
                        <p className="font-medium text-foreground mt-2">No reply will be sent to the sender</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {classification === 'INCOMPLETE' && processingResult.shouldReply && (
                  <>
                    <Card className="border-warning bg-warning-muted">
                      <CardContent className="pt-4">
                        <p className="text-sm font-medium text-foreground mb-2">Send Clarification Email</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          An automated email will be sent to <span className="font-medium">{processingResult.extractedQuery?.customerEmail}</span> requesting the missing information.
                        </p>
                        
                        {!clarificationSent ? (
                          <Button
                            onClick={handleSendClarification}
                            variant="default"
                            className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
                          >
                            <Send className="size-4 mr-2" />
                            Send Clarification Request
                          </Button>
                        ) : (
                          <Card className="bg-background">
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="size-4 text-success" />
                                <p className="text-sm font-medium text-foreground">Clarification Email Sent</p>
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p>✓ Email sent to customer</p>
                                <p>✓ Status set to "Waiting for Customer"</p>
                                <p>✓ Query will be processed once customer replies</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="border-info bg-info-muted">
                      <CardContent className="pt-4">
                        <p className="text-xs font-medium text-foreground mb-1">Email Template Preview:</p>
                        <div className="bg-background rounded p-2 text-xs text-muted-foreground whitespace-pre-wrap">
                          {processingResult.replyMessage}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
                
                {classification === 'VALID' && (
                  <>
                    <Card className="border-success bg-success-muted">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="size-4 text-success" />
                          <p className="text-sm font-medium text-foreground">Service Query Created</p>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>✓ Query logged in FSM system</p>
                          <p>✓ Acknowledgement email sent to customer</p>
                          <p>✓ Status set to "Query Logged"</p>
                          <p>✓ SLA timer started (4-hour response)</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {processingResult.shouldReply && processingResult.replyMessage && (
                      <Card className="border-info bg-info-muted">
                        <CardContent className="pt-4">
                          <p className="text-xs font-medium text-foreground mb-1">Acknowledgement Email Sent:</p>
                          <div className="bg-background rounded p-2 text-xs text-muted-foreground whitespace-pre-wrap">
                            {processingResult.replyMessage}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
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
        ? 'bg-destructive/5 border-destructive/20' 
        : 'bg-muted border-border'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-muted-foreground">{label}</span>
        {isMissing && (
          <Badge variant="destructive" className="text-[10px] px-1 py-0">
            Missing
          </Badge>
        )}
      </div>
      <div className={isMissing ? 'text-muted-foreground italic' : 'text-foreground'}>
        {value || 'Not found'}
      </div>
    </div>
  );
}
