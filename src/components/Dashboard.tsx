import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, Calendar, Mail, User, Building2, Wrench, MapPin, Trash2, X, Phone, FileText } from 'lucide-react';
import type { Email } from '../App';
import { fetchEmails } from '../services/emailFetchService';
import { Card, CardContent } from './ui/card';

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Requests Dashboard</h1>
            <p className="text-gray-600">Overview of all logged service queries (Dashboard v2)</p>
          </div>
          <button
            onClick={handleClearAll}
            disabled={clearing || emails.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="size-4" />
            {clearing ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 mb-8 grid-cols-2 lg:grid-cols-4">
          {/* Total Queries Card */}
          <div className="bg-white p-2 rounded-xl shadow-lg w-full max-w-[240px] mx-auto transition-transform hover:scale-[1.02]">
            <div className="bg-gray-100 w-full h-24 rounded-xl flex items-center justify-center transition-transform hover:scale-[0.98] origin-bottom cursor-pointer">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div className="uppercase text-xs font-bold text-green-600 pt-2 px-2 cursor-pointer">
              Total Queries
            </div>
            <div className="font-bold text-gray-600 p-2 cursor-pointer">
              <span className="text-xl">{stats.total}</span> Queries
              <div className="text-gray-400 font-normal text-[11px] pt-4">
                 By <span className="font-semibold text-gray-600"></span>
              </div>
            </div>
          </div>

          {/* Urgent Card */}
          <div className="bg-white p-2 rounded-xl shadow-lg w-full max-w-[240px] mx-auto transition-transform hover:scale-[1.02]">
            <div className="bg-gray-100 w-full h-24 rounded-xl flex items-center justify-center transition-transform hover:scale-[0.98] origin-bottom cursor-pointer">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <div className="uppercase text-xs font-bold text-red-600 pt-2 px-2 cursor-pointer">
              Urgent Requests
            </div>
            <div className="font-bold text-gray-600 p-2 cursor-pointer">
              <span className="text-xl">{stats.urgent}</span> Requests
              <div className="text-gray-400 font-normal text-[11px] pt-4">
                  <span className="font-semibold text-gray-600"> </span> 
              </div>
            </div>
          </div>

          {/* Maintenance Card */}
          <div className="bg-white p-2 rounded-xl shadow-lg w-full max-w-[240px] mx-auto transition-transform hover:scale-[1.02]">
            <div className="bg-gray-100 w-full h-24 rounded-xl flex items-center justify-center transition-transform hover:scale-[0.98] origin-bottom cursor-pointer">
              <Wrench className="w-10 h-10 text-blue-600" />
            </div>
            <div className="uppercase text-xs font-bold text-blue-600 pt-2 px-2 cursor-pointer">
              Maintenance
            </div>
            <div className="font-bold text-gray-600 p-2 cursor-pointer">
              <span className="text-xl">{stats.maintenance}</span> Scheduled
              <div className="text-gray-400 font-normal text-[11px] pt-4">
                  <span className="font-semibold text-gray-600"></span> 
              </div>
            </div>
          </div>

          {/* Repairs Card */}
          <div className="bg-white p-2 rounded-xl shadow-lg w-full max-w-[240px] mx-auto transition-transform hover:scale-[1.02]">
            <div className="bg-gray-100 w-full h-24 rounded-xl flex items-center justify-center transition-transform hover:scale-[0.98] origin-bottom cursor-pointer">
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
            <div className="uppercase text-xs font-bold text-orange-600 pt-2 px-2 cursor-pointer">
              Repairs 
            </div>
            <div className="font-bold text-gray-600 p-2 cursor-pointer">
              <span className="text-xl">{stats.repair}</span> Active
              <div className="text-gray-400 font-normal text-[11px] pt-4">
                 By <span className="font-semibold text-gray-600">Support</span> • Ongoing
              </div>
            </div>
          </div>
        </div>

        {/* Queries Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Service Requests</h2>
          </div>

          {validQueries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No service requests logged yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] table-fixed">
                <colgroup>
                  <col className="w-[18%]" />
                  <col className="w-[12%]" />
                  <col className="w-[22%]" />
                  <col className="w-[14%]" />
                  <col className="w-[10%]" />
                  <col className="w-[12%]" />
                  <col className="w-[8%]" />
                </colgroup>
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider bg-blue-50">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider bg-green-50">
                      Service Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider bg-purple-50">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider bg-amber-50">
                      Asset/Equipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider bg-red-50">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider bg-teal-50">
                      Received
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-black divide-solid">
                  {validQueries.map((email) => (
                    <tr 
                      key={email.id} 
                      onClick={() => setSelectedEmail(email)}
                      className="cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap bg-blue-50/30 hover:bg-blue-50/50">
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
                      <td className="px-6 py-4 whitespace-nowrap bg-green-50/30 hover:bg-green-50/50">
                        <div className="flex items-center">
                          <Wrench className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-900">
                            {email.extractedQuery?.serviceType || 'Not specified'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 bg-purple-50/30 hover:bg-purple-50/50">
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
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
                      <td className="px-6 py-4 whitespace-nowrap bg-amber-50/30 hover:bg-amber-50/50">
                        <span className="text-sm text-gray-900">
                          {email.extractedQuery?.assetBrand || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap bg-red-50/30 hover:bg-red-50/50">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          email.extractedQuery?.urgency?.toLowerCase().includes('urgent')
                            ? 'bg-red-100 text-red-800'
                            : email.extractedQuery?.urgency?.toLowerCase().includes('high')
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {email.extractedQuery?.urgency || 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap bg-teal-50/30 hover:bg-teal-50/50">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1 text-teal-500" />
                          {new Date(email.receivedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm bg-gray-50/50 hover:bg-gray-100/50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(email.id);
                          }}
                          disabled={deletingId === email.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 p-2 hover:bg-red-50 rounded transition-colors"
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
        <div className="mt-6 text-center">
          <button
            onClick={loadEmails}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Service Request Detail Modal */}
      {selectedEmail && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEmail(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  selectedEmail.extractedQuery?.urgency?.toLowerCase().includes('urgent')
                    ? 'bg-red-100'
                    : 'bg-green-100'
                }`}>
                  <FileText className={`w-5 h-5 ${
                    selectedEmail.extractedQuery?.urgency?.toLowerCase().includes('urgent')
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Service Request Details</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedEmail.receivedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedEmail.extractedQuery?.customerName || selectedEmail.senderName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm text-gray-900">
                        {selectedEmail.extractedQuery?.customerEmail || selectedEmail.senderEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Service Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Service Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedEmail.extractedQuery?.serviceType || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Urgency</p>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedEmail.extractedQuery?.urgency?.toLowerCase().includes('urgent')
                          ? 'bg-red-100 text-red-800'
                          : selectedEmail.extractedQuery?.urgency?.toLowerCase().includes('high')
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedEmail.extractedQuery?.urgency || 'Normal'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Asset/Equipment Brand</p>
                      <p className="text-sm text-gray-900">
                        {selectedEmail.extractedQuery?.assetBrand || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Building Type</p>
                      <p className="text-sm text-gray-900">
                        {selectedEmail.extractedQuery?.buildingType || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">
                    {selectedEmail.extractedQuery?.address || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Issue Description
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedEmail.extractedQuery?.description || selectedEmail.body}
                  </p>
                </div>
              </div>

              {/* Original Email */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Original Email
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Subject</p>
                  <p className="text-sm font-medium text-gray-900 mb-3">{selectedEmail.subject}</p>
                  <p className="text-xs text-gray-500 mb-1">Message</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedEmail.body}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    selectedEmail.status === 'Query Logged'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
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
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
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
