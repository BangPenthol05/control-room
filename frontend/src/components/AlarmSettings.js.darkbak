import { useState, useEffect } from 'react';

export default function AlarmSettings({ user }) {
  const [settings, setSettings] = useState({
    alarmThreshold: 10,
    enableSound: true,
    enableEmailNotifications: false,
    enableSMSNotifications: false,
    emailRecipients: '',
    smsRecipients: '',
    autoResolveAlarm: false,
    autoResolveTime: 60
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('alarmSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('alarmSettings', JSON.stringify(settings));
    setSuccessMessage('Alarm settings saved successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleReset = () => {
    const defaultSettings = {
      alarmThreshold: 10,
      enableSound: true,
      enableEmailNotifications: false,
      enableSMSNotifications: false,
      emailRecipients: '',
      smsRecipients: '',
      autoResolveAlarm: false,
      autoResolveTime: 60
    };
    setSettings(defaultSettings);
    localStorage.setItem('alarmSettings', JSON.stringify(defaultSettings));
    setSuccessMessage('Settings reset to default');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="p-6" data-testid="alarm-settings-container">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Alarm Settings</h1>
          <p className="text-gray-600 mt-1">Configure alarm thresholds and notification preferences</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg" data-testid="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Alarm Threshold */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alarm Trigger Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alarm Threshold (seconds): <span className="font-bold text-blue-600">{settings.alarmThreshold}s</span>
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Trigger alarm when door is open longer than this duration
                </p>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  data-testid="alarm-threshold-slider"
                  value={settings.alarmThreshold}
                  onChange={(e) => setSettings({ ...settings, alarmThreshold: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5s</span>
                  <span>30s</span>
                  <span>60s</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableSound"
                  data-testid="enable-sound-checkbox"
                  checked={settings.enableSound}
                  onChange={(e) => setSettings({ ...settings, enableSound: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="enableSound" className="text-sm font-medium text-gray-700">
                  Enable sound alerts
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
            <div className="space-y-4">
              {/* Email Notifications */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="enableEmail"
                    data-testid="enable-email-checkbox"
                    checked={settings.enableEmailNotifications}
                    onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="enableEmail" className="text-sm font-medium text-gray-700">
                    Enable email notifications
                  </label>
                </div>
                {settings.enableEmailNotifications && (
                  <input
                    type="text"
                    placeholder="Enter email addresses (comma separated)"
                    data-testid="email-recipients-input"
                    value={settings.emailRecipients}
                    onChange={(e) => setSettings({ ...settings, emailRecipients: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* SMS Notifications */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="enableSMS"
                    data-testid="enable-sms-checkbox"
                    checked={settings.enableSMSNotifications}
                    onChange={(e) => setSettings({ ...settings, enableSMSNotifications: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="enableSMS" className="text-sm font-medium text-gray-700">
                    Enable SMS notifications
                  </label>
                </div>
                {settings.enableSMSNotifications && (
                  <input
                    type="text"
                    placeholder="Enter phone numbers (comma separated)"
                    data-testid="sms-recipients-input"
                    value={settings.smsRecipients}
                    onChange={(e) => setSettings({ ...settings, smsRecipients: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Auto-Resolve Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Auto-Resolve Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoResolve"
                  data-testid="auto-resolve-checkbox"
                  checked={settings.autoResolveAlarm}
                  onChange={(e) => setSettings({ ...settings, autoResolveAlarm: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="autoResolve" className="text-sm font-medium text-gray-700">
                  Auto-resolve alarm when door closes
                </label>
              </div>

              {settings.autoResolveAlarm && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-resolve delay: <span className="font-bold text-blue-600">{settings.autoResolveTime}s</span>
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    Wait time before auto-resolving alarm after door closes
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="10"
                    data-testid="auto-resolve-time-slider"
                    value={settings.autoResolveTime}
                    onChange={(e) => setSettings({ ...settings, autoResolveTime: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Immediate</span>
                    <span>60s</span>
                    <span>120s</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              data-testid="save-settings-button"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
            <button
              type="button"
              onClick={handleReset}
              data-testid="reset-settings-button"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}