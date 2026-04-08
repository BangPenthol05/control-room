import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FileText, Filter, User, Activity, Download, Eye, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found');
    window.location.href = '/';
    return { headers: {} };
  }
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export default function AuditLogs({ user }) {
  const [logs, setLogs] = useState([]);
  const [filterAction, setFilterAction] = useState('');
  const [filterUsername, setFilterUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [filterAction, filterUsername]);

  const fetchLogs = async () => {
    try {
      let url = `${API}/audit-logs?limit=500`;
      if (filterAction) url += `&action_type=${filterAction}`;
      if (filterUsername) url += `&username=${filterUsername}`;
      const response = await axios.get(url, getAuthHeaders());
      setLogs(response.data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const actionTypes = [...new Set(logs.map((log) => log.action_type).filter(Boolean))];
  const usernames = [...new Set(logs.map((log) => log.username).filter(Boolean))];

  const getActionColor = (actionType) => {
    if (actionType.includes('login')) return 'bg-blue-100 text-blue-800';
    if (actionType.includes('alarm')) return 'bg-red-100 text-red-800';
    if (actionType.includes('created')) return 'bg-green-100 text-green-800';
    if (actionType.includes('deleted')) return 'bg-red-100 text-red-800';
    if (actionType.includes('updated') || actionType.includes('bulk')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800 dark:text-gray-100';
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Details'];
    const rows = logs.map(log => [
      format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss'),
      log.username || 'System',
      log.action_type,
      log.details || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="audit-logs-container">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <FileText className="w-8 h-8 mr-3 text-blue-600" />
            Audit Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Comprehensive activity history and system logs</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            data-testid="export-logs-csv-button"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportToJSON}
            data-testid="export-logs-json-button"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Filter by Action Type
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              data-testid="filter-action-select"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              {actionTypes.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Filter by User
            </label>
            <select
              value={filterUsername}
              onChange={(e) => setFilterUsername(e.target.value)}
              data-testid="filter-username-select"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {usernames.map((username) => (
                <option key={username} value={username}>
                  {username}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(filterAction || filterUsername) && (
          <button
            onClick={() => {
              setFilterAction('');
              setFilterUsername('');
            }}
            data-testid="clear-filters-button"
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <Filter className="w-4 h-4 mr-1" />
            Clear Filters
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" data-testid="audit-logs-table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} data-testid={`audit-log-row-${log.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        <User className="w-4 h-4 mr-1 text-gray-400" />
                        {log.username || 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(
                          log.action_type
                        )}`}
                      >
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-md">
                        {log.details || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetailModal(true);
                        }}
                        data-testid={`detail-log-button-${log.id}`}
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600 dark:text-gray-300 text-center flex items-center justify-center">
        <FileText className="w-4 h-4 mr-2" />
        Showing {logs.length} log entries
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="audit-log-detail-modal">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                Detail Audit Log
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* User & Action */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedLog.username || 'System'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Action Type</p>
                  <span
                    className={`mt-1 px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getActionColor(
                      selectedLog.action_type
                    )}`}
                  >
                    {selectedLog.action_type}
                  </span>
                </div>
              </div>

              {/* Target Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Target Type</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedLog.target_type || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Target ID</p>
                  <p className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    {selectedLog.target_id || '-'}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Details</p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedLog.details || 'No additional details'}
                  </p>
                </div>
              </div>

              {/* Old Value → New Value */}
              {(selectedLog.old_value || selectedLog.new_value) && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Changes Made</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Old Value</p>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded">
                        <p className="text-sm text-red-800 dark:text-red-300 font-mono">
                          {selectedLog.old_value || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">New Value</p>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded">
                        <p className="text-sm text-green-800 dark:text-green-300 font-mono">
                          {selectedLog.new_value || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Timestamp</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {format(new Date(selectedLog.timestamp), 'EEEE, dd MMMM yyyy - HH:mm:ss')}
                </p>
              </div>

              {/* IDs */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Log ID</p>
                  <p className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded break-all">
                    {selectedLog.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                  <p className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded break-all">
                    {selectedLog.user_id || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}