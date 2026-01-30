import { CheckCircle2, Mail, Clock, MapPin, FileText, Calendar, Tag, Wrench, Building2, Zap } from 'lucide-react';
import type { LoggedQuery } from '../App';

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
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {/* Success Header */}
        <div className="p-6 border-b border-slate-200 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle2 className="size-6 text-green-600" />
            </div>
            <div>
              <h2 className="font-medium text-slate-900">Query Logged Successfully</h2>
              <p className="text-sm text-slate-600 mt-1">
                Service query has been created and customer notified
              </p>
            </div>
          </div>
        </div>

        {/* Query Details */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="size-4 text-slate-400" />
                <span className="text-xs text-slate-600">Query Reference</span>
              </div>
              <p className="font-mono font-medium text-slate-900">{query.queryId}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="size-4 text-slate-400" />
                <span className="text-xs text-slate-600">Status</span>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                {query.status}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-900 mb-3">Customer Information</h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-600">Customer Name</span>
                </div>
                <p className="text-sm text-slate-900">{query.customerName}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="size-3 text-slate-400" />
                  <span className="text-xs text-slate-600">Customer Email</span>
                </div>
                <p className="text-sm text-slate-900">{query.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-900 mb-3">Service Details</h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="size-3 text-slate-400" />
                  <span className="text-xs text-slate-600">Service Type</span>
                </div>
                <p className="text-sm text-slate-900">{query.serviceType || 'Not specified'}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="size-3 text-slate-400" />
                  <span className="text-xs text-slate-600">Elevator Brand</span>
                </div>
                <p className="text-sm text-slate-900">{query.elevatorBrand || 'Not specified'}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="size-3 text-slate-400" />
                  <span className="text-xs text-slate-600">Building Type</span>
                </div>
                <p className="text-sm text-slate-900">{query.buildingType || 'Not specified'}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="size-3 text-slate-400" />
                  <span className="text-xs text-slate-600">Address</span>
                </div>
                <p className="text-sm text-slate-900">{query.address}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="size-3 text-slate-400" />
                  <span className="text-xs text-slate-600">Urgency</span>
                </div>
                <p className="text-sm text-slate-900">{query.urgency}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="size-3 text-slate-400" />
                  <span className="text-xs text-slate-600">Description</span>
                </div>
                <p className="text-sm text-slate-900">{query.description}</p>
              </div>
            </div>
          </div>

          {/* Query Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-1">Source</p>
              <p className="text-sm text-slate-900">{query.source}</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-1">SLA</p>
              <p className="text-sm text-slate-900">{query.sla}</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-1">Assigned Engineer</p>
              <p className="text-sm text-slate-900">{query.assignedEngineer}</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="size-3 text-slate-400" />
                <p className="text-xs text-slate-600">Acknowledged At</p>
              </div>
              <p className="text-sm text-slate-900">{formatDateTime(query.acknowledgedAt)}</p>
            </div>
          </div>

          {/* Acknowledgement Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="size-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900">Acknowledgement Email Sent</p>
                <p className="text-xs text-slate-600 mt-1">
                  An automated confirmation email has been sent to {query.customerEmail} with the query reference {query.queryId}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
