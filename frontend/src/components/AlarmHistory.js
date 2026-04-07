import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Bell, Filter, CheckCircle, Clock, Download } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function AlarmHistory({ user }) {
  const [alarms, setAlarms] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlarms();
    const interval = setInterval(fetchAlarms, 10000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const fetchAlarms = async () => {
    try {
      let url = `${API}/alarms?limit=100`;
      if (filterStatus !== 'all') {
        url += `&status=${filterStatus}`;
      }
      const response = await axios.get(url, getAuthHeaders());
      setAlarms(response.data);
    } catch (err) {
      console.error('Error fetching alarms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveAlarm = async (alarmId) => {
    try {
      await axios.patch(
        `${API}/alarms/${alarmId}/resolve`,
        { ended_at: new Date().toISOString() },
        getAuthHeaders()
      );
      fetchAlarms();
    } catch (err) {
      console.error('Error resolving alarm:', err);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const exportToCSV = () => {
    const headers = ['Sensor Name', 'Location', 'Triggered At', 'Duration', 'Status'];
    const rows = alarms.map(alarm => [
      alarm.sensor_name,
      alarm.sensor_location,
      format(new Date(alarm.triggered_at), 'MMM dd, yyyy HH:mm:ss'),
      alarm.status === 'active' ? 'Ongoing' : formatDuration(alarm.duration),
      alarm.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alarm_history_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(alarms, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alarm_history_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.json`;
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
    <div className="p-6" data-testid="alarm-history-container">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Bell className="w-8 h-8 mr-3 text-red-600" />
            Alarm History
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">View and manage alarm events</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            data-testid="export-csv-button"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportToJSON}
            data-testid="export-json-button"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filter by Status
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterStatus('all')}
            data-testid="filter-all-button"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
            }`}
          >
            All ({alarms.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            data-testid="filter-active-button"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'active'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            data-testid="filter-resolved-button"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'resolved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" data-testid="alarm-table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sensor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Triggered At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
              {alarms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No alarms found
                  </td>
                </tr>
              ) : (
                alarms.map((alarm) => (
                  <tr key={alarm.id} data-testid={`alarm-row-${alarm.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{alarm.sensor_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-300">{alarm.sensor_location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {format(new Date(alarm.triggered_at), 'MMM dd, yyyy HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {alarm.status === 'active' ? (
                          <span className="text-red-600 font-medium animate-pulse">Ongoing</span>
                        ) : (
                          formatDuration(alarm.duration)
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${
                          alarm.status === 'active'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                        data-testid={`alarm-status-${alarm.id}`}
                      >
                        {alarm.status === 'active' ? (
                          <><Bell className="w-3 h-3 mr-1" /> Active</>
                        ) : (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Resolved</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {alarm.status === 'active' ? (
                        <button
                          onClick={() => resolveAlarm(alarm.id)}
                          data-testid={`resolve-alarm-button-${alarm.id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}