import { useState, type MouseEvent } from 'react';
import { CheckCircle2, Clock, Calendar, Mail, User, Building2, Wrench, MapPin, Trash2, FileText, AlertCircle } from 'lucide-react';
import type { Email } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const API_BASE_URL = import.meta.env.VITE_EMAIL_API_URL || 'https://ai-powered-fsm-email-intake-1.vercel.app';

interface DashboardProps {
  emails: Email[];
  onRefresh: () => void;
}

export function Dashboard({ emails, onRefresh }: DashboardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const handleDelete = async (emailId: string) => {
    if (!confirm('Are you sure you want to delete this service request?')) {
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

      onRefresh(); // Refresh the list via parent
    } catch (err) {
      console.error('Failed to delete email:', err);
      // We could add a toast or alert here
    } finally {
      setDeletingId(null);
    }
  };

  // Filter only VALID/Query Logged emails
  const validQueries = emails.filter(
    email => email.classification === 'VALID' || email.status === 'Query Logged'
  );

  const stats = {
    total: validQueries.length,
    urgent: validQueries.filter(e => e.extractedQuery?.urgency?.toLowerCase().includes('urgent')).length,
    maintenance: validQueries.filter(e => e.extractedQuery?.serviceType?.toLowerCase().includes('maintenance')).length,
    repair: validQueries.filter(e => e.extractedQuery?.serviceType?.toLowerCase().includes('repair')).length,
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Service Requests Dashboard</h1>
            <p className="text-muted-foreground">Overview of all logged service queries</p>
          </div>
          {/* Action buttons moved to App header */}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 mb-8 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-foreground">{stats.total}</span>
                <CheckCircle2 className="size-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Urgent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-foreground">{stats.urgent}</span>
                <AlertCircle className="size-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-foreground">{stats.maintenance}</span>
                <Wrench className="size-8 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Repairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-foreground">{stats.repair}</span>
                <Clock className="size-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Service Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {validQueries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Mail className="size-16 mx-auto mb-4 text-muted" />
                <p>No service requests logged yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validQueries.map((email) => (
                    <TableRow
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">
                              {email.extractedQuery?.customerName || email.senderName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {email.extractedQuery?.customerEmail || email.senderEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wrench className="size-4 text-muted-foreground" />
                          <span>{email.extractedQuery?.serviceType || 'Not specified'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="size-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p>{email.extractedQuery?.address || 'Not specified'}</p>
                            {email.extractedQuery?.buildingType && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Building2 className="size-3" />
                                {email.extractedQuery.buildingType}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {email.extractedQuery?.assetBrand || 'Not specified'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          email.extractedQuery?.urgency?.toLowerCase().includes('urgent') ||
                            email.extractedQuery?.urgency?.toLowerCase().includes('emergency')
                            ? 'destructive'
                            : email.extractedQuery?.urgency?.toLowerCase().includes('high')
                              ? 'warning'
                              : 'success'
                        }>
                          {email.extractedQuery?.urgency || 'Normal'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="size-4" />
                          {new Date(email.receivedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            handleDelete(email.id);
                          }}
                          disabled={deletingId === email.id}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Request Detail Modal */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEmail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${selectedEmail.extractedQuery?.urgency?.toLowerCase().includes('urgent')
                    ? 'bg-destructive/10'
                    : 'bg-success/10'
                    }`}>
                    <FileText className={`size-5 ${selectedEmail.extractedQuery?.urgency?.toLowerCase().includes('urgent')
                      ? 'text-destructive'
                      : 'text-success'
                      }`} />
                  </div>
                  <div>
                    <DialogTitle>Service Request Details</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedEmail.receivedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Customer Information */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User className="size-4" />
                    Customer Information
                  </h3>
                  <div className="bg-muted rounded-lg p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Name</p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedEmail.extractedQuery?.customerName || selectedEmail.senderName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="text-sm text-foreground">
                        {selectedEmail.extractedQuery?.customerEmail || selectedEmail.senderEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Wrench className="size-4" />
                    Service Details
                  </h3>
                  <div className="bg-muted rounded-lg p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Service Type</p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedEmail.extractedQuery?.serviceType || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Urgency</p>
                      <Badge variant={
                        selectedEmail.extractedQuery?.urgency?.toLowerCase().includes('urgent')
                          ? 'destructive'
                          : selectedEmail.extractedQuery?.urgency?.toLowerCase().includes('high')
                            ? 'warning'
                            : 'success'
                      }>
                        {selectedEmail.extractedQuery?.urgency || 'Normal'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Asset/Equipment</p>
                      <p className="text-sm text-foreground">
                        {selectedEmail.extractedQuery?.assetBrand || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Building Type</p>
                      <p className="text-sm text-foreground">
                        {selectedEmail.extractedQuery?.buildingType || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin className="size-4" />
                    Location
                  </h3>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-foreground">
                      {selectedEmail.extractedQuery?.address || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="size-4" />
                    Issue Description
                  </h3>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedEmail.extractedQuery?.description || selectedEmail.body}
                    </p>
                  </div>
                </div>

                {/* Original Email */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Mail className="size-4" />
                    Original Email
                  </h3>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Subject</p>
                    <p className="text-sm font-medium text-foreground mb-3">{selectedEmail.subject}</p>
                    <p className="text-xs text-muted-foreground mb-1">Message</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {selectedEmail.body}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge variant={selectedEmail.status === 'Query Logged' ? 'success' : 'info'}>
                      {selectedEmail.status}
                    </Badge>
                  </div>
                  <Button
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      handleDelete(selectedEmail.id);
                      setSelectedEmail(null);
                    }}
                    disabled={deletingId === selectedEmail.id}
                    variant="destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete Request
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
