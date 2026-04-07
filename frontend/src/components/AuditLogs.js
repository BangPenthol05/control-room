import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FileText, Filter, User, Activity, Download } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function AuditLogs({ user }) {
  const [logs, setLogs] = useState([]);
  const [filterAction, setFilterAction] = useState('');
  const [filterUsername, setFilterUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
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
                      <div className="text-sm text-gray-600 dark:text-gray-300">{log.details || '-'}</div>
                      {log.old_value && log.new_value && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="font-medium">Changed:</span> {log.old_value} → {log.new_value}
                        </div>
                      )}
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
    </div>
  );
}