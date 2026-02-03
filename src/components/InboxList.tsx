import { useState } from 'react';
import { Mail, Clock, CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import type { Email } from '../App';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

const API_BASE_URL = import.meta.env.VITE_EMAIL_API_URL || 'https://ai-powered-fsm-email-intake-1.vercel.app';

interface InboxListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onEmailSelect: (emailId: string) => void;
  onEmailDeleted?: () => void;
}

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

  const getStatusBadgeVariant = (status: Email['status']) => {
    switch (status) {
      case 'Query Logged': return 'success';
      case 'Waiting for Customer': return 'warning';
      case 'Junk': return 'muted';
      default: return 'secondary';
    }
  };

  const renderEmailList = (tabStatus: InboxTab) => {
    const tabEmails = emails.filter(email => email.status === tabStatus);
    
    if (tabEmails.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Mail className="size-12 mb-2" />
          <p className="text-sm">No {tabStatus.toLowerCase()} emails</p>
        </div>
      );
    }

    return tabEmails.map((email) => (
      <div
        key={email.id}
        onClick={() => onEmailSelect(email.id)}
        className={`p-4 border-b border-border cursor-pointer transition-colors ${
          selectedEmailId === email.id 
            ? 'bg-muted border-l-2 border-l-primary' 
            : 'hover:bg-muted/50'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="size-4 text-muted-foreground flex-shrink-0" />
              <p className="font-medium text-foreground truncate">{email.senderName}</p>
            </div>
            <p className="text-sm text-muted-foreground truncate">{email.senderEmail}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {formatDateTime(email.receivedAt)}
            </div>
            <Button
              onClick={(e) => handleDelete(email.id, e)}
              disabled={deletingId === email.id}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-foreground mb-2 truncate">{email.subject}</p>
        
        <Badge variant={getStatusBadgeVariant(email.status)}>
          {email.status}
        </Badge>
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-medium text-foreground mb-4">Inbox</h2>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as InboxTab)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="Query Logged" className="text-xs gap-1">
              <CheckCircle2 className="size-3" />
              Logged
              <span className="ml-1 text-[10px] bg-background px-1 rounded">
                {counts['Query Logged']}
              </span>
            </TabsTrigger>
            
            <TabsTrigger value="Waiting for Customer" className="text-xs gap-1">
              <AlertCircle className="size-3" />
              Waiting
              <span className="ml-1 text-[10px] bg-background px-1 rounded">
                {counts['Waiting for Customer']}
              </span>
            </TabsTrigger>
            
            <TabsTrigger value="Junk" className="text-xs gap-1">
              <XCircle className="size-3" />
              Junk
              <span className="ml-1 text-[10px] bg-background px-1 rounded">
                {counts['Junk']}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {renderEmailList(activeTab)}
      </div>
    </div>
  );
}
