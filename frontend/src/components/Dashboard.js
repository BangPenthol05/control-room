import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SensorCard from './SensorCard';
import { Slider } from '@/components/ui/slider';
import { BarChart3, TrendingUp, Activity, AlertCircle, CheckCircle, XCircle, Bell } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard({ user }) {
  // Early return if no user authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  const [sensors, setSensors] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [globalVolume, setGlobalVolume] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCharts, setShowCharts] = useState(true);

  const fetchSensors = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/sensors`, getAuthHeaders());
      setSensors(response.data);
    } catch (err) {
      console.error('Error fetching sensors:', err);
      setError('Failed to load sensors');
    }
  }, []);

  const fetchAlarms = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/alarms?limit=100`, getAuthHeaders());
      setAlarms(response.data);
    } catch (err) {
      console.error('Error fetching alarms:', err);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/audit-logs?limit=50`, getAuthHeaders());
      setAuditLogs(response.data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSensors(), fetchAlarms(), fetchAuditLogs()]);
      setIsLoading(false);
    };
    loadData();

    const interval = setInterval(() => {
      fetchSensors();
      fetchAlarms();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchSensors, fetchAlarms, fetchAuditLogs]);

  const updateSensor = async (sensorId, updateData) => {
    try {
      await axios.patch(`${API}/sensors/${sensorId}`, updateData, getAuthHeaders());
      await fetchSensors();
      showSuccess('Sensor updated successfully');
    } catch (err) {
      setError('Failed to update sensor');
    }
  };

  const handleGlobalEnableDisable = async (enable) => {
    try {
      const sensorIds = sensors.map(s => s.id);
      await axios.post(
        `${API}/sensors/bulk-control`,
        { sensor_ids: sensorIds, action: enable ? 'enable' : 'disable' },
        getAuthHeaders()
      );
      await fetchSensors();
      showSuccess(`All sensors ${enable ? 'enabled' : 'disabled'}`);
    } catch (err) {
      setError('Failed to update sensors');
    }
  };

  const handleGlobalVolumeChange = async () => {
    try {
      const sensorIds = sensors.map(s => s.id);
      await axios.post(
        `${API}/sensors/bulk-control`,
        { sensor_ids: sensorIds, action: 'volume', value: globalVolume },
        getAuthHeaders()
      );
      await fetchSensors();
      showSuccess(`Volume set to ${globalVolume}% for all sensors`);
    } catch (err) {
      setError('Failed to update volume');
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Chart Data Processing
  const sensorStatusData = [
    { name: 'Active', value: sensors.filter(s => s.is_enabled).length },
    { name: 'Inactive', value: sensors.filter(s => !s.is_enabled).length },
    { name: 'Alarm', value: sensors.filter(s => s.status === 'alarm').length },
  ];

  const alarmTrendData = alarms.slice(0, 10).reverse().map((alarm, idx) => ({
    name: `A${idx + 1}`,
    duration: alarm.duration || 0,
    sensor: alarm.sensor_name
  }));

  const activityData = auditLogs.slice(0, 10).reverse().map((log, idx) => ({
    time: new Date(log.timestamp).getHours() + ':00',
    actions: 1
  }));

  const activeSensors = sensors.filter(s => s.is_enabled).length;
  const inactiveSensors = sensors.length - activeSensors;
  const sensorsInAlarm = sensors.filter(s => s.status === 'alarm').length;
  const activeAlarms = alarms.filter(a => a.status === 'active').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="dashboard-container">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Control Room Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Real-time sensor monitoring and control</p>
          </div>
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2"
          >
            <BarChart3 className="w-5 h-5" />
            <span>{showCharts ? 'Hide' : 'Show'} Charts</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center" data-testid="error-message">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center" data-testid="success-message">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {activeAlarms > 0 && (
        <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-4 animate-pulse" data-testid="active-alarms-banner">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-red-900">Active Alarms: {activeAlarms}</h3>
              <p className="text-sm text-red-700">Door(s) have been open for more than 10 seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-testid="total-sensors-card">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Sensors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sensors.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-testid="active-sensors-card">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeSensors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-testid="inactive-sensors-card">
          <div className="flex items-center">
            <div className="bg-gray-100 rounded-lg p-3">
              <XCircle className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Inactive</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{inactiveSensors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-testid="alarms-card">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-lg p-3">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">In Alarm</p>
              <p className="text-2xl font-bold text-red-600">{sensorsInAlarm}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sensor Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Sensor Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sensorStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sensorStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Alarm Duration Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Recent Alarm Durations
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={alarmTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="duration" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Global Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8" data-testid="global-controls">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Global Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Enable/Disable All</label>
            <div className="flex space-x-3">
              <button
                onClick={() => handleGlobalEnableDisable(true)}
                data-testid="global-enable-button"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Enable All
              </button>
              <button
                onClick={() => handleGlobalEnableDisable(false)}
                data-testid="global-disable-button"
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Disable All
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Global Volume: {globalVolume}%
            </label>
            <div className="flex items-center space-x-4">
              <Slider
                value={[globalVolume]}
                onValueChange={(value) => setGlobalVolume(value[0])}
                max={100}
                step={1}
                className="flex-1"
                data-testid="global-volume-slider"
              />
              <button
                onClick={handleGlobalVolumeChange}
                data-testid="apply-global-volume-button"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Apply to All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sensor Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sensors.map((sensor) => (
            <SensorCard
              key={sensor.id}
              sensor={sensor}
              onUpdate={updateSensor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}