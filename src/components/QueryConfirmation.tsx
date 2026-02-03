import { CheckCircle2, Mail, Clock, MapPin, FileText, Tag, Wrench, Building2, Zap } from 'lucide-react';
import type { LoggedQuery } from '../App';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';

interface QueryConfirmationProps {
  query: LoggedQuery;
}

export function QueryConfirmation({ query }: QueryConfirmationProps) {
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
        {/* Success Header */}
        <CardHeader className="bg-success-muted border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 p-2 rounded-full">
              <CheckCircle2 className="size-6 text-success" />
            </div>
            <div>
              <h2 className="font-medium text-foreground">Query Logged Successfully</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Service query has been created and customer notified
              </p>
            </div>
          </div>
        </CardHeader>

        {/* Query Details */}
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Query Reference</span>
              </div>
              <p className="font-mono font-medium text-foreground">{query.queryId}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Status</span>
              </div>
              <Badge variant="success">{query.status}</Badge>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-3">Customer Information</h3>
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">Customer Name</span>
                </div>
                <p className="text-sm text-foreground">{query.customerName}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Customer Email</span>
                </div>
                <p className="text-sm text-foreground">{query.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-3">Service Details</h3>
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Service Type</span>
                </div>
                <p className="text-sm text-foreground">{query.serviceType || 'Not specified'}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Asset/Equipment Brand</span>
                </div>
                <p className="text-sm text-foreground">{query.assetBrand || 'Not specified'}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Building Type</span>
                </div>
                <p className="text-sm text-foreground">{query.buildingType || 'Not specified'}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Address</span>
                </div>
                <p className="text-sm text-foreground">{query.address}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Urgency</span>
                </div>
                <p className="text-sm text-foreground">{query.urgency}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Description</span>
                </div>
                <p className="text-sm text-foreground">{query.description}</p>
              </div>
            </div>
          </div>

          {/* Query Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Source</p>
              <p className="text-sm text-foreground">{query.source}</p>
            </div>
            
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">SLA</p>
              <p className="text-sm text-foreground">{query.sla}</p>
            </div>
            
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Assigned Engineer</p>
              <p className="text-sm text-foreground">{query.assignedEngineer}</p>
            </div>
            
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="size-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Acknowledged At</p>
              </div>
              <p className="text-sm text-foreground">{formatDateTime(query.acknowledgedAt)}</p>
            </div>
          </div>

          {/* Acknowledgement Notice */}
          <div className="mt-6 p-4 bg-info-muted border border-info rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="size-4 text-info mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Acknowledgement Email Sent</p>
                <p className="text-xs text-muted-foreground mt-1">
                  An automated confirmation email has been sent to {query.customerEmail} with the query reference {query.queryId}.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
