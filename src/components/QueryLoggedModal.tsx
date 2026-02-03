import { CheckCircle2, Tag, MapPin, FileText, Mail, Wrench, Building2, Zap } from 'lucide-react';
import type { LoggedQuery } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface QueryLoggedModalProps {
  query: LoggedQuery;
  onClose: () => void;
}

export function QueryLoggedModal({ query, onClose }: QueryLoggedModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="bg-success-muted -mx-6 -mt-6 px-6 py-4 rounded-t-lg border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 p-2 rounded-full">
              <CheckCircle2 className="size-6 text-success" />
            </div>
            <div>
              <DialogTitle>Query Logged Successfully!</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Service query created from email
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4 mt-4">
          {/* Query ID - Prominent */}
          <Card className="border-2">
            <CardContent className="pt-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Tag className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Query Reference</span>
              </div>
              <p className="font-mono text-xl font-bold text-foreground">{query.queryId}</p>
            </CardContent>
          </Card>

          {/* Customer & Service Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-muted p-2 rounded">
                <Mail className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="text-sm font-medium text-foreground">{query.customerName}</p>
                <p className="text-sm text-muted-foreground">{query.customerEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-muted p-2 rounded">
                <Wrench className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Service Type</p>
                <p className="text-sm text-foreground">{query.serviceType || 'Not specified'}</p>
              </div>
            </div>

            {query.assetBrand && (
              <div className="flex items-start gap-3">
                <div className="bg-muted p-2 rounded">
                  <Tag className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Asset Brand</p>
                  <p className="text-sm text-foreground">{query.assetBrand}</p>
                </div>
              </div>
            )}

            {query.buildingType && (
              <div className="flex items-start gap-3">
                <div className="bg-muted p-2 rounded">
                  <Building2 className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Building Type</p>
                  <p className="text-sm text-foreground">{query.buildingType}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="bg-muted p-2 rounded">
                <MapPin className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm text-foreground">{query.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-muted p-2 rounded">
                <Zap className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Urgency</p>
                <p className="text-sm text-foreground">{query.urgency}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-muted p-2 rounded">
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm text-foreground">{query.description}</p>
              </div>
            </div>
          </div>

          {/* SLA Info */}
          <Card className="border-info bg-info-muted">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-foreground mb-1">SLA: {query.sla}</p>
              <p className="text-xs text-muted-foreground">
                Acknowledgement email has been sent to the customer with query reference.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
