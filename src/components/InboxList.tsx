import { useState } from 'react';
import { Mail, Clock, CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import type { Email } from '../App';

const API_BASE_URL = import.meta.env.VITE_EMAIL_API_URL || 'https://ai-powered-fsm-email-intake-1.vercel.app';

interface InboxListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onEmailSelect: (emailId: string) => void;
  onEmailDeleted?: () => void;
}

const statusColors = {
  'Unprocessed': 'bg-blue-100 text-blue-800',
  'Junk': 'bg-slate-100 text-slate-600',
  'Waiting for Customer': 'bg-amber-100 text-amber-800',
  'Query Logged': 'bg-green-100 text-green-800'
};

type InboxTab = 'Query Logged' | 'Waiting for Customer' | 'Junk';

export function InboxList({ emails, selectedEmailId, onEmailSelect, onEmailDeleted }: InboxListProps) {
  const [activeTab, setActiveTab] = useState<InboxTab>('Query Logged');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent email selection when clicking delete
    
    if (!confirm('Are you sure you want to delete this email?')) {
      return;
    }

    try {
      setDeletingId(emailId);
      const response = await fetch(`${API_BASE_URL}/api/delete-email?id=${emailId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete email');
      }

      onEmailDeleted?.(); // Refresh the email list
    } catch (error) {
      console.error('Failed to delete email:', error);
      alert('Failed to delete email. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  // Filter emails by active tab
  const filteredEmails = emails.filter(email => email.status === activeTab);

  // Count emails by status
  const counts = {
    'Query Logged': emails.filter(e => e.status === 'Query Logged').length,
    'Waiting for Customer': emails.filter(e => e.status === 'Waiting for Customer').length,
    'Junk': emails.filter(e => e.status === 'Junk').length,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-medium text-slate-900 mb-4">Inbox</h2>
        
        {/* Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('Query Logged')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'Query Logged'
                ? 'bg-green-100 text-green-800'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="size-4" />
            Query Logged
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-xs">
              {counts['Query Logged']}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('Waiting for Customer')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'Waiting for Customer'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="size-4" />
            Waiting
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-xs">
              {counts['Waiting for Customer']}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('Junk')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'Junk'
                ? 'bg-slate-100 text-slate-800'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <XCircle className="size-4" />
            Junk
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-xs">
              {counts['Junk']}
            </span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Mail className="size-12 mb-2" />
            <p className="text-sm">No {activeTab.toLowerCase()} emails</p>
          </div>
        ) : (
          filteredEmails.map((email) => (
          <div
            key={email.id}
            onClick={() => onEmailSelect(email.id)}
            className={`p-4 border-b border-slate-200 cursor-pointer transition-colors ${
              selectedEmailId === email.id 
                ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="size-4 text-slate-400 flex-shrink-0" />
                  <p className="font-medium text-slate-900 truncate">{email.senderName}</p>
                </div>
                <p className="text-sm text-slate-600 truncate">{email.senderEmail}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatDateTime(email.receivedAt)}
                </div>
                <button
                  onClick={(e) => handleDelete(email.id, e)}
                  disabled={deletingId === email.id}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  title="Delete email"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-slate-900 mb-2 truncate">{email.subject}</p>
            
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[email.status]}`}>
                {email.status}
              </span>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}
