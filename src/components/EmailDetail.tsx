import { Clock, User } from 'lucide-react';
import type { Email } from '../App';
import { Card, CardContent, CardHeader } from './ui/card';

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
      <Card>
        {/* Email Header */}
        <CardHeader className="border-b border-border">
          <h2 className="font-medium text-foreground mb-4">{email.subject}</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{email.senderName}</p>
                <p className="text-sm text-muted-foreground">{email.senderEmail}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="size-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Received: {formatDateTime(email.receivedAt)}
              </p>
            </div>
          </div>
        </CardHeader>

        {/* Email Body */}
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-muted-foreground">
              {email.body}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
