import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SensorCard from './SensorCard';
import { Slider } from '@/components/ui/slider';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function Dashboard({ user }) {
  const [sensors, setSensors] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [globalVolume, setGlobalVolume] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      const response = await axios.get(`${API}/alarms?status=active&limit=10`, getAuthHeaders());
      setAlarms(response.data);
    } catch (err) {
      console.error('Error fetching alarms:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSensors(), fetchAlarms()]);
      setIsLoading(false);
    };
    loadData();

    // Refresh data every 5 seconds for real-time updates
    const interval = setInterval(() => {
      fetchSensors();
      fetchAlarms();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchSensors, fetchAlarms]);

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
        {
          sensor_ids: sensorIds,
          action: enable ? 'enable' : 'disable'
        },
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
        {
          sensor_ids: sensorIds,
          action: 'volume',
          value: globalVolume
        },
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

  const activeSensors = sensors.filter(s => s.is_enabled).length;
  const inactiveSensors = sensors.length - activeSensors;
  const sensorsInAlarm = sensors.filter(s => s.status === 'alarm').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="dashboard-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Control Room Dashboard</h1>
        <p className="text-gray-600 mt-1">Real-time sensor monitoring and control</p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" data-testid="error-message">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg" data-testid="success-message">
          {successMessage}
        </div>
      )}

      {/* Active Alarms */}
      {alarms.length > 0 && (
        <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-4 animate-pulse" data-testid="active-alarms-banner">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-red-900">Active Alarms: {alarms.length}</h3>
              <p className="text-sm text-red-700">Door(s) have been open for more than 10 seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6" data-testid="total-sensors-card">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sensors</p>
              <p className="text-2xl font-bold text-gray-900">{sensors.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6" data-testid="active-sensors-card">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeSensors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6" data-testid="inactive-sensors-card">
          <div className="flex items-center">
            <div className="bg-gray-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{inactiveSensors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6" data-testid="alarms-card">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Alarm</p>
              <p className="text-2xl font-bold text-red-600">{sensorsInAlarm}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-8" data-testid="global-controls">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Global Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enable/Disable All</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sensor Status</h2>
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