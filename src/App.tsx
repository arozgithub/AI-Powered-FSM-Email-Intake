import { useState, useEffect } from 'react';
import { InboxList } from './components/InboxList';
import { EmailDetail } from './components/EmailDetail';
import { AIAgentPanel } from './components/AIAgentPanel';
import { QueryConfirmation } from './components/QueryConfirmation';
import { QueryLoggedModal } from './components/QueryLoggedModal';
import { Dashboard } from './components/Dashboard';
import type { ExtractedQuery } from './types/emailProcessing';
import { fetchEmails } from './services/emailFetchService';
import { RefreshCw, AlertCircle, LayoutDashboard, Mail, Trash2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';

const API_BASE_URL = import.meta.env.VITE_EMAIL_API_URL || 'https://ai-powered-fsm-email-intake-1.vercel.app';

export interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  receivedAt: string;
  status: 'Unprocessed' | 'Junk' | 'Waiting for Customer' | 'Query Logged';
  body: string;
  classification?: 'JUNK' | 'INCOMPLETE' | 'VALID';
  extractedQuery?: ExtractedQuery;
  shouldReply?: boolean;
  replyMessage?: string;
}

export interface ExtractedFields extends ExtractedQuery {
  // Legacy compatibility - maps to new ExtractedQuery structure
}

export interface LoggedQuery {
  queryId: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  assetBrand: string;
  buildingType: string;
  address: string;
  urgency: string;
  description: string;
  status: string;
  source: string;
  sla: string;
  assignedEngineer: string;
  acknowledgedAt: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'inbox' | 'dashboard'>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [showQueryConfirmation, setShowQueryConfirmation] = useState(false);
  const [loggedQuery, setLoggedQuery] = useState<LoggedQuery | null>(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  // Load emails on component mount
  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    setIsLoadingEmails(true);
    setEmailsError(null);
    
    try {
      const fetchedEmails = await fetchEmails();
      setEmails(fetchedEmails);
      
      if (fetchedEmails.length === 0) {
        setEmailsError('No emails found. Emails will appear here when received from n8n workflow.');
      }
    } catch (error) {
      setEmailsError(error instanceof Error ? error.message : 'Failed to fetch emails');
      console.error('Failed to load emails:', error);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const selectedEmail = emails.find(e => e.id === selectedEmailId) || null;

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmailId(emailId);
    setShowQueryConfirmation(false);
    setShowQueryModal(false);
  };

  const handleStatusUpdate = (emailId: string, newStatus: Email['status']) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, status: newStatus } : e
    ));
  };

  const handleQueryLogged = (query: LoggedQuery) => {
    setLoggedQuery(query);
    setShowQueryModal(true);
    setShowQueryConfirmation(true);
    if (selectedEmailId) {
      handleStatusUpdate(selectedEmailId, 'Query Logged');
    }
  };

  const handleCloseModal = () => {
    setShowQueryModal(false);
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all emails from inbox and dashboard? This cannot be undone.')) {
      return;
    }

    try {
      setClearing(true);
      const response = await fetch(`${API_BASE_URL}/api/clear-emails`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clear emails');
      }

      await loadEmails(); // Reload to show empty state
      setSelectedEmailId(null); // Clear selection
    } catch (err) {
      setEmailsError(err instanceof Error ? err.message : 'Failed to clear emails');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-foreground">FSM Email Intake System</h1>
            <p className="text-sm text-muted-foreground">AI-Powered Service Desk</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Navigation Tabs */}
            <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as 'inbox' | 'dashboard')}>
              <TabsList>
                <TabsTrigger value="inbox" className="gap-2">
                  <Mail className="size-4" />
                  Inbox
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="gap-2">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button
              onClick={loadEmails}
              disabled={isLoadingEmails}
              variant="default"
              size="default"
            >
              <RefreshCw className={`size-4 mr-2 ${isLoadingEmails ? 'animate-spin' : ''}`} />
              {isLoadingEmails ? 'Refreshing...' : 'Refresh'}
            </Button>

            <Button
              onClick={handleClearAll}
              disabled={clearing || emails.length === 0}
              variant="destructive"
              size="default"
            >
              <Trash2 className="size-4 mr-2" />
              {clearing ? 'Clearing...' : 'Clear All'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentView === 'dashboard' ? (
        <Dashboard />
      ) : (
      <div className="flex h-[calc(100vh-73px)]">
        {/* Inbox List - Left Panel */}
        <div className="w-80 border-r border-border bg-card overflow-y-auto">
          {emailsError ? (
            <div className="p-4">
              <div className="bg-warning-muted border border-warning rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Cannot Load Emails</h3>
                    <p className="text-sm text-muted-foreground">{emailsError}</p>
                    <Button
                      onClick={loadEmails}
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-info hover:text-info"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : isLoadingEmails && emails.length === 0 ? (
            <div className="p-4">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="size-8 text-muted-foreground animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Loading emails...</p>
                </div>
              </div>
            </div>
          ) : (
            <InboxList 
              emails={emails} 
              selectedEmailId={selectedEmailId}
              onEmailSelect={handleEmailSelect}
              onEmailDeleted={loadEmails}
            />
          )}
        </div>

        {/* Email Detail - Center Panel */}
        <div className="flex-1 overflow-y-auto bg-muted">
          {selectedEmail ? (
            showQueryConfirmation && loggedQuery ? (
              <QueryConfirmation query={loggedQuery} />
            ) : (
              <EmailDetail email={selectedEmail} />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                {emails.length === 0 && !isLoadingEmails && !emailsError ? (
                  <div>
                    <p className="mb-2">No emails available</p>
                    <p className="text-sm text-muted-foreground">Emails will appear when received from n8n Gmail integration</p>
                  </div>
                ) : (
                  <p>Select an email to view details</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Agent Panel - Right Panel */}
        {selectedEmail && !showQueryConfirmation && (
          <div className="w-80 border-l border-border bg-card overflow-y-auto">
            <AIAgentPanel 
              email={selectedEmail}
              onStatusUpdate={handleStatusUpdate}
              onQueryLogged={handleQueryLogged}
            />
          </div>
        )}
      </div>
      )}

      {/* Query Logged Modal */}
      {showQueryModal && loggedQuery && (
        <QueryLoggedModal query={loggedQuery} onClose={handleCloseModal} />
      )}
    </div>
  );
}
