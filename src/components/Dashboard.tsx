import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, Calendar, Mail, User, Building2, Wrench, MapPin, Trash2, X, Phone, FileText } from 'lucide-react';
import type { Email } from '../App';
import { fetchEmails } from '../services/emailFetchService';

const API_BASE_URL = import.meta.env.VITE_EMAIL_API_URL || 'https://ai-powered-fsm-email-intake-1.vercel.app';

export function Dashboard() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEmails = await fetchEmails();
      setEmails(fetchedEmails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all emails? This cannot be undone.')) {
      return;
    }

    try {
      setClearing(true);
      const response = await fetch(`${API_BASE_URL}/api/clear-emails`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clear emails');
      }

      await loadEmails(); // Reload to show empty state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear emails');
    } finally {
      setClearing(false);
    }
  };

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

      await loadEmails(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete email');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button 
            onClick={loadEmails}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Service Requests Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Overview of all logged service queries</p>
          </div>
          <button
            onClick={handleClearAll}
            disabled={clearing || emails.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Trash2 className="size-5" />
            {clearing ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Queries</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {stats.total}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Urgent</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.urgent}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Maintenance</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  {stats.maintenance}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                <Wrench className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Repairs</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {stats.repair}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Queries Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-xl font-bold text-gray-900">Service Requests</h2>
            <p className="text-sm text-gray-600 mt-1">Click on any request to view details</p>
          </div>

          {validQueries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 mb-4">
                <Mail className="w-10 h-10 text-blue-400" />
              </div>
              <p className="text-gray-500 text-lg">No service requests logged yet</p>
              <p className="text-gray-400 text-sm mt-2">New requests will appear here automatically</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Service Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Asset/Equipment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Received
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {validQueries.map((email) => (
                    <tr 
                      key={email.id} 
                      onClick={() => setSelectedEmail(email)}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {email.extractedQuery?.customerName || email.senderName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {email.extractedQuery?.customerEmail || email.senderEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Wrench className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {email.extractedQuery?.serviceType || 'Not specified'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-gray-900">
                            {email.extractedQuery?.address || 'Not specified'}
                            {email.extractedQuery?.buildingType && (
                              <div className="flex items-center mt-1">
                                <Building2 className="w-3 h-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">
                                  {email.extractedQuery.buildingType}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {email.extractedQuery?.assetBrand || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                          email.extractedQuery?.urgency?.toLowerCase().includes('urgent')
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            : email.extractedQuery?.urgency?.toLowerCase().includes('high')
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                        }`}>
                          {email.extractedQuery?.urgency || 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(email.receivedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(email.id);
                          }}
                          disabled={deletingId === email.id}
                          className="text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 disabled:opacity-50 p-2.5 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-110"
                          title="Delete this request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={loadEmails}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:-translate-y-0.5"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Service Request Detail Modal */}
      {selectedEmail && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setSelectedEmail(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm ${
                  selectedEmail.extractedQuery?.urgency?.toLowerCase().includes('urgent')
                    ? 'ring-2 ring-red-300'
                    : 'ring-2 ring-white/30'
                }`}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Service Request Details</h2>
                  <p className="text-sm text-blue-100">
                    {new Date(selectedEmail.receivedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-slate-50">
              {/* Customer Information */}
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Name</p>
                    <p className="text-sm font-bold text-gray-900">
                      {selectedEmail.extractedQuery?.customerName || selectedEmail.senderName}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Email</p>
                    <p className="text-sm text-gray-900 break-all">
                      {selectedEmail.extractedQuery?.customerEmail || selectedEmail.senderEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                  </div>
                  Service Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Service Type</p>
                    <p className="text-sm font-bold text-gray-900">
                      {selectedEmail.extractedQuery?.serviceType || 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Urgency</p>
                    <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                      selectedEmail.extractedQuery?.urgency?.toLowerCase().includes('urgent')
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                        : selectedEmail.extractedQuery?.urgency?.toLowerCase().includes('high')
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    }`}>
                      {selectedEmail.extractedQuery?.urgency || 'Normal'}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Asset/Equipment Brand</p>
                    <p className="text-sm text-gray-900">
                      {selectedEmail.extractedQuery?.assetBrand || 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Building Type</p>
                    <p className="text-sm text-gray-900">
                      {selectedEmail.extractedQuery?.buildingType || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  Location
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedEmail.extractedQuery?.address || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  Issue Description
                </h3>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {selectedEmail.extractedQuery?.description || selectedEmail.body}
                  </p>
                </div>
              </div>

              {/* Original Email */}
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                    <Mail className="w-4 h-4 text-amber-600" />
                  </div>
                  Original Email
                </h3>
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Subject</p>
                    <p className="text-sm font-bold text-gray-900">{selectedEmail.subject}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Message</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                      {selectedEmail.body}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Status</p>
                  <span className={`px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-xl shadow-md ${
                    selectedEmail.status === 'Query Logged'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  }`}>
                    {selectedEmail.status}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(selectedEmail.id);
                    setSelectedEmail(null);
                  }}
                  disabled={deletingId === selectedEmail.id}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:-translate-y-0.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
