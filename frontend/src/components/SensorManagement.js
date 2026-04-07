import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function SensorManagement({ user }) {
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSensor, setEditingSensor] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [testingAlarm, setTestingAlarm] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    esp8266_mac: '',
    current_volume: 50,
    is_enabled: true
  });

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const response = await axios.get(`${API}/sensors`, getAuthHeaders());
      setSensors(response.data);
    } catch (err) {
      console.error('Error fetching sensors:', err);
      setError('Failed to load sensors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (sensor = null) => {
    if (sensor) {
      setEditingSensor(sensor);
      setFormData({
        name: sensor.name,
        location: sensor.location,
        esp8266_mac: sensor.esp8266_mac || '',
        current_volume: sensor.current_volume,
        is_enabled: sensor.is_enabled
      });
    } else {
      setEditingSensor(null);
      setFormData({
        name: '',
        location: '',
        esp8266_mac: '',
        current_volume: 50,
        is_enabled: true
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSensor(null);
    setFormData({ name: '', location: '', esp8266_mac: '', current_volume: 50, is_enabled: true });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingSensor) {
        await axios.patch(`${API}/sensors/${editingSensor.id}`, formData, getAuthHeaders());
        setSuccessMessage('Sensor updated successfully');
      } else {
        await axios.post(`${API}/sensors`, formData, getAuthHeaders());
        setSuccessMessage('Sensor created successfully');
      }
      handleCloseModal();
      fetchSensors();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save sensor');
    }
  };

  const handleDelete = async (sensorId, sensorName) => {
    if (!window.confirm(`Are you sure you want to delete sensor "${sensorName}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API}/sensors/${sensorId}`, getAuthHeaders());
      setSuccessMessage('Sensor deleted successfully');
      fetchSensors();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete sensor');
    }
  };

  const handleTestAlarm = async (sensor) => {
    setTestingAlarm(sensor.id);
    
    try {
      // Create test alarm
      await axios.post(`${API}/alarms`, {
        sensor_id: sensor.id,
        sensor_name: sensor.name,
        sensor_location: sensor.location
      }, getAuthHeaders());
      
      // Update sensor status to alarm
      await axios.patch(`${API}/sensors/${sensor.id}`, {
        status: 'alarm'
      }, getAuthHeaders());
      
      setSuccessMessage(`Test alarm triggered for ${sensor.name}`);
      fetchSensors();
      
      // Auto-resolve after 10 seconds
      setTimeout(async () => {
        try {
          const alarmsResponse = await axios.get(`${API}/alarms?status=active&limit=1`, getAuthHeaders());
          if (alarmsResponse.data.length > 0) {
            const activeAlarm = alarmsResponse.data[0];
            await axios.patch(`${API}/alarms/${activeAlarm.id}/resolve`, {
              ended_at: new Date().toISOString()
            }, getAuthHeaders());
            fetchSensors();
          }
        } catch (err) {
          console.error('Error resolving test alarm:', err);
        }
      }, 10000);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to test alarm');
    } finally {
      setTestingAlarm(null);
    }
  };

  if (isLoading) {
    return (
      <div className=\"flex items-center justify-center min-h-screen\">
        <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600\"></div>
      </div>
    );
  }

  return (
    <div className=\"p-6\" data-testid=\"sensor-management-container\">
      <div className=\"mb-6 flex justify-between items-center\">
        <div>
          <h1 className=\"text-2xl font-bold text-gray-900\">Sensor Management</h1>
          <p className=\"text-gray-600 mt-1\">Manage door sensors - Create, Edit, Delete & Test</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          data-testid=\"create-sensor-button\"
          className=\"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2\"
        >
          <Plus className=\"w-5 h-5\" />
          <span>Add Sensor</span>
        </button>
      </div>

      {error && (
        <div className=\"mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg\" data-testid=\"error-message\">
          {error}
        </div>
      )}
      {successMessage && (
        <div className=\"mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg\" data-testid=\"success-message\">
          {successMessage}
        </div>
      )}

      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
        {sensors.map((sensor) => (
          <div
            key={sensor.id}
            className=\"bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-600\"
            data-testid={`sensor-mgmt-card-${sensor.id}`}
          >
            <div className=\"flex justify-between items-start mb-3\">
              <div className=\"flex-1\">
                <h3 className=\"text-lg font-bold text-gray-900\">{sensor.name}</h3>
                <p className=\"text-sm text-gray-600\">{sensor.location}</p>
                {sensor.esp8266_mac && (
                  <p className=\"text-xs text-gray-500 font-mono mt-1\">MAC: {sensor.esp8266_mac}</p>
                )}
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                sensor.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {sensor.is_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className=\"space-y-2 text-sm text-gray-600 mb-4\">
              <div className=\"flex justify-between\">
                <span>Status:</span>
                <span className=\"font-medium capitalize\">{sensor.status}</span>
              </div>
              <div className=\"flex justify-between\">
                <span>Volume:</span>
                <span className=\"font-medium\">{sensor.current_volume}%</span>
              </div>
              <div className=\"flex justify-between\">
                <span>Last Seen:</span>
                <span className=\"font-medium\">{format(new Date(sensor.last_seen), 'HH:mm:ss')}</span>
              </div>
            </div>

            <div className=\"space-y-2\">
              <div className=\"flex space-x-2\">
                <button
                  onClick={() => handleOpenModal(sensor)}
                  data-testid={`edit-sensor-button-${sensor.id}`}
                  className=\"flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1\"
                >
                  <Edit2 className=\"w-4 h-4\" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(sensor.id, sensor.name)}
                  data-testid={`delete-sensor-button-${sensor.id}`}
                  className=\"flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1\"
                >
                  <Trash2 className=\"w-4 h-4\" />
                  <span>Delete</span>
                </button>
              </div>
              <button
                onClick={() => handleTestAlarm(sensor)}
                disabled={testingAlarm === sensor.id || !sensor.is_enabled}
                data-testid={`test-alarm-button-${sensor.id}`}
                className=\"w-full px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed\"
              >
                <AlertTriangle className=\"w-4 h-4\" />
                <span>{testingAlarm === sensor.id ? 'Testing...' : 'Test Alarm'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4\" data-testid=\"sensor-modal\">
          <div className=\"bg-white rounded-lg p-6 max-w-md w-full\">
            <h2 className=\"text-xl font-bold text-gray-900 mb-4\">
              {editingSensor ? 'Edit Sensor' : 'Create New Sensor'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className=\"space-y-4\">
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                    Sensor Name *
                  </label>
                  <input
                    type=\"text\"
                    required
                    data-testid=\"sensor-name-input\"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500\"
                    placeholder=\"e.g., Door 14\"
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                    Location *
                  </label>
                  <input
                    type=\"text\"
                    required
                    data-testid=\"sensor-location-input\"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500\"
                    placeholder=\"e.g., Building C - Floor 3\"
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                    ESP8266 MAC Address
                  </label>
                  <input
                    type=\"text\"
                    data-testid=\"sensor-mac-input\"
                    value={formData.esp8266_mac}
                    onChange={(e) => setFormData({ ...formData, esp8266_mac: e.target.value })}
                    className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm\"
                    placeholder=\"e.g., AA:BB:CC:DD:EE:FF\"
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                    Default Volume: {formData.current_volume}%
                  </label>
                  <input
                    type=\"range\"
                    min=\"0\"
                    max=\"100\"
                    data-testid=\"sensor-volume-input\"
                    value={formData.current_volume}
                    onChange={(e) => setFormData({ ...formData, current_volume: parseInt(e.target.value) })}
                    className=\"w-full\"
                  />
                </div>
                <div className=\"flex items-center space-x-2\">
                  <input
                    type=\"checkbox\"
                    id=\"is_enabled\"
                    data-testid=\"sensor-enabled-checkbox\"
                    checked={formData.is_enabled}
                    onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                    className=\"w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500\"
                  />
                  <label htmlFor=\"is_enabled\" className=\"text-sm font-medium text-gray-700\">
                    Enable sensor by default
                  </label>
                </div>
              </div>

              <div className=\"mt-6 flex space-x-3\">
                <button
                  type=\"submit\"
                  data-testid=\"submit-sensor-button\"
                  className=\"flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors\"
                >
                  {editingSensor ? 'Update Sensor' : 'Create Sensor'}
                </button>
                <button
                  type=\"button\"
                  onClick={handleCloseModal}
                  data-testid=\"cancel-sensor-button\"
                  className=\"flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors\"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
