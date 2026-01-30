import { Mail, Clock, User } from 'lucide-react';
import type { Email } from '../App';

interface EmailDetailProps {
  email: Email;
}

export function EmailDetail({ email }: EmailDetailProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {/* Email Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-medium text-slate-900 mb-4">{email.subject}</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="size-4 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">{email.senderName}</p>
                <p className="text-sm text-slate-600">{email.senderEmail}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="size-4 text-slate-400" />
              <p className="text-sm text-slate-600">
                Received: {formatDateTime(email.receivedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-slate-700">
              {email.body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
