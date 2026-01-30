import { CheckCircle2, X, Tag, MapPin, FileText, Calendar, Mail, Wrench, Building2, Zap } from 'lucide-react';
import type { LoggedQuery } from '../App';

interface QueryLoggedModalProps {
  query: LoggedQuery;
  onClose: () => void;
}

export function QueryLoggedModal({ query, onClose }: QueryLoggedModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-green-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle2 className="size-6 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Query Logged Successfully!</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Service query created from email
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Query ID - Prominent */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Tag className="size-4 text-slate-600" />
              <span className="text-sm text-slate-600">Query Reference</span>
            </div>
            <p className="font-mono text-xl font-bold text-slate-900">{query.queryId}</p>
          </div>

          {/* Customer & Service Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded">
                <Mail className="size-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-600">Customer</p>
                <p className="text-sm font-medium text-slate-900">{query.customerName}</p>
                <p className="text-sm text-slate-600">{query.customerEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded">
                <Wrench className="size-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-600">Service Type</p>
                <p className="text-sm text-slate-900">{query.serviceType || 'Not specified'}</p>
              </div>
            </div>

            {query.elevatorBrand && (
              <div className="flex items-start gap-3">
                <div className="bg-slate-100 p-2 rounded">
                  <Tag className="size-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-600">Elevator Brand</p>
                  <p className="text-sm text-slate-900">{query.elevatorBrand}</p>
                </div>
              </div>
            )}

            {query.buildingType && (
              <div className="flex items-start gap-3">
                <div className="bg-slate-100 p-2 rounded">
                  <Building2 className="size-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-600">Building Type</p>
                  <p className="text-sm text-slate-900">{query.buildingType}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded">
                <MapPin className="size-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-600">Address</p>
                <p className="text-sm text-slate-900">{query.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded">
                <Zap className="size-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-600">Urgency</p>
                <p className="text-sm text-slate-900">{query.urgency}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded">
                <FileText className="size-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-600">Description</p>
                <p className="text-sm text-slate-900">{query.description}</p>
              </div>
            </div>
          </div>

          {/* SLA Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-900 mb-1">SLA: {query.sla}</p>
            <p className="text-xs text-slate-600">
              Acknowledgement email has been sent to the customer with query reference.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
