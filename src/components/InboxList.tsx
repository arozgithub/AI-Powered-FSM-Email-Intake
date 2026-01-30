import { Mail, Clock } from 'lucide-react';
import type { Email } from '../App';

interface InboxListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onEmailSelect: (emailId: string) => void;
}

const statusColors = {
  'Unprocessed': 'bg-blue-100 text-blue-800',
  'Junk': 'bg-slate-100 text-slate-600',
  'Waiting for Customer': 'bg-amber-100 text-amber-800',
  'Query Logged': 'bg-green-100 text-green-800'
};

export function InboxList({ emails, selectedEmailId, onEmailSelect }: InboxListProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-medium text-slate-900">Inbox</h2>
        <p className="text-sm text-slate-600">{emails.length} emails</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {emails.map((email) => (
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
              <div className="text-xs text-slate-500 flex-shrink-0 flex items-center gap-1">
                <Clock className="size-3" />
                {formatDateTime(email.receivedAt)}
              </div>
            </div>
            
            <p className="text-sm text-slate-900 mb-2 truncate">{email.subject}</p>
            
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[email.status]}`}>
                {email.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
