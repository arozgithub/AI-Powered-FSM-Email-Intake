import { useState, useEffect } from 'react';
import { InboxList } from './components/InboxList';
import { EmailDetail } from './components/EmailDetail';
import { AIAgentPanel } from './components/AIAgentPanel';
import { QueryConfirmation } from './components/QueryConfirmation';
import { QueryLoggedModal } from './components/QueryLoggedModal';
import { Dashboard } from './components/Dashboard';
import type { ExtractedQuery } from './types/emailProcessing';
import { fetchEmails } from './services/emailFetchService';
import { RefreshCw, AlertCircle, LayoutDashboard, Mail } from 'lucide-react';

export interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  receivedAt: string;
  status: 'Unprocessed' | 'Junk' | 'Waiting for Customer' | 'Query Logged';
  body: string;
}

export interface ExtractedFields extends ExtractedQuery {
  // Legacy compatibility - maps to new ExtractedQuery structure
}

export interface LoggedQuery {
  queryId: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  elevatorBrand: string;
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-slate-900">FSM Email Intake System</h1>
            <p className="text-sm text-slate-600">AI-Powered Service Desk</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Navigation Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('inbox')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'inbox'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Mail className="size-4" />
                Inbox
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </button>
            </div>
            
            <button
              onClick={loadEmails}
              disabled={isLoadingEmails}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`size-4 ${isLoadingEmails ? 'animate-spin' : ''}`} />
              {isLoadingEmails ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentView === 'dashboard' ? (
        <Dashboard />
      ) : (
      <div className="flex h-[calc(100vh-97px)]">
        {/* Inbox List - Left Panel */}
        <div className="w-96 border-r border-slate-200 bg-white overflow-y-auto">
          {emailsError ? (
            <div className="p-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">Cannot Load Emails</h3>
                    <p className="text-sm text-slate-600">{emailsError}</p>
                    <button
                      onClick={loadEmails}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : isLoadingEmails && emails.length === 0 ? (
            <div className="p-4">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="size-8 text-slate-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-600">Loading emails...</p>
                </div>
              </div>
            </div>
          ) : (
            <InboxList 
              emails={emails} 
              selectedEmailId={selectedEmailId}
              onEmailSelect={handleEmailSelect}
            />
          )}
        </div>

        {/* Email Detail - Center Panel */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {selectedEmail ? (
            showQueryConfirmation && loggedQuery ? (
              <QueryConfirmation query={loggedQuery} />
            ) : (
              <EmailDetail email={selectedEmail} />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500">
                {emails.length === 0 && !isLoadingEmails && !emailsError ? (
                  <div>
                    <p className="mb-2">No emails available</p>
                    <p className="text-sm text-slate-400">Emails will appear when received from n8n Gmail integration</p>
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
          <div className="w-96 border-l border-slate-200 bg-white overflow-y-auto">
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
