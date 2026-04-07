import { useState, useEffect } from 'react';

export default function SystemSettings({ user }) {
  const [settings, setSettings] = useState({
    systemName: 'IoT Alarm System',
    refreshInterval: 5,
    enableDarkMode: false,
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY',
    enableAuditLog: true,
    logRetentionDays: 90,
    maxFailedLoginAttempts: 5,
    sessionTimeout: 24
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    setSuccessMessage('System settings saved successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="p-6" data-testid="system-settings-container">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure system preferences and behavior</p>
        </div>

        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg" data-testid="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Name
                </label>
                <input
                  type="text"
                  data-testid="system-name-input"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dashboard Refresh Interval: <span className="font-bold text-blue-600">{settings.refreshInterval}s</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  data-testid="refresh-interval-slider"
                  value={settings.refreshInterval}
                  onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  data-testid="timezone-select"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                  <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                  <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Failed Login Attempts
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  data-testid="max-login-attempts-input"
                  value={settings.maxFailedLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxFailedLoginAttempts: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  data-testid="session-timeout-input"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Audit Log Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Log Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableAuditLog"
                  data-testid="enable-audit-log-checkbox"
                  checked={settings.enableAuditLog}
                  onChange={(e) => setSettings({ ...settings, enableAuditLog: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="enableAuditLog" className="text-sm font-medium text-gray-700">
                  Enable comprehensive audit logging
                </label>
              </div>

              {settings.enableAuditLog && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Log Retention Period (days)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="365"
                    data-testid="log-retention-input"
                    value={settings.logRetentionDays}
                    onChange={(e) => setSettings({ ...settings, logRetentionDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            data-testid="save-system-settings-button"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}