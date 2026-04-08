import { useState, useEffect } from 'react';
import { Mail, Send, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) return { headers: {} };
  return { headers: { Authorization: `Bearer ${token}` } };
};

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
  
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    use_tls: true
  });
  
  const [emailTemplates, setEmailTemplates] = useState({
    alarm: {
      subject: '🚨 Alarm Triggered - {{sensor_name}}',
      body: 'Alarm has been triggered on sensor {{sensor_name}} at {{location}}.\n\nTime: {{timestamp}}\nDetails: {{details}}'
    },
    sensor_offline: {
      subject: '⚠️ Sensor Offline - {{sensor_name}}',
      body: 'Sensor {{sensor_name}} at {{location}} is currently offline.\n\nLast seen: {{last_seen}}\nPlease check the sensor connection.'
    },
    system_change: {
      subject: 'ℹ️ System Configuration Changed',
      body: 'System configuration has been modified.\n\nChanged by: {{user}}\nChange type: {{change_type}}\nDetails: {{details}}\nTime: {{timestamp}}'
    }
  });
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');

  useEffect(() => {
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Load SMTP config and email templates from backend
    fetchSmtpConfig();
    fetchEmailTemplates();
  }, []);
  
  const fetchSmtpConfig = async () => {
    try {
      const response = await axios.get(`${API}/settings/smtp`, getAuthHeaders());
      if (response.data) {
        setSmtpConfig(response.data);
      }
    } catch (err) {
      console.error('Error fetching SMTP config:', err);
    }
  };
  
  const fetchEmailTemplates = async () => {
    try {
      const response = await axios.get(`${API}/settings/email-templates`, getAuthHeaders());
      if (response.data) {
        setEmailTemplates(response.data);
      }
    } catch (err) {
      console.error('Error fetching email templates:', err);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    setSuccessMessage('System settings saved successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/settings/smtp`, smtpConfig, getAuthHeaders());
      setSuccessMessage('SMTP configuration saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to save SMTP configuration');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };
  
  const handleSaveTemplates = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/settings/email-templates`, emailTemplates, getAuthHeaders());
      setSuccessMessage('Email templates saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to save email templates');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };
  
  const handleTestEmail = async () => {
    if (!testEmailRecipient) {
      setErrorMessage('Please enter a recipient email address');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setTestingEmail(true);
    try {
      await axios.post(`${API}/settings/test-email`, {
        recipient: testEmailRecipient
      }, getAuthHeaders());
      setSuccessMessage('Test email sent successfully! Please check your inbox.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to send test email');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="p-6" data-testid="system-settings-container">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Configure system preferences and behavior</p>
        </div>

        {successMessage && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center gap-2" data-testid="success-message">
            <AlertCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2" data-testid="error-message">
            <AlertCircle className="w-5 h-5" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* General Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  System Name
                </label>
                <input
                  type="text"
                  data-testid="system-name-input"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Timezone
                </label>
                <select
                  data-testid="timezone-select"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Max Failed Login Attempts
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  data-testid="max-login-attempts-input"
                  value={settings.maxFailedLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxFailedLoginAttempts: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Session Timeout (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  data-testid="session-timeout-input"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Audit Log Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audit Log Settings</h2>
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
                <label htmlFor="enableAuditLog" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Enable comprehensive audit logging
                </label>
              </div>

              {settings.enableAuditLog && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Log Retention Period (days)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="365"
                    data-testid="log-retention-input"
                    value={settings.logRetentionDays}
                    onChange={(e) => setSettings({ ...settings, logRetentionDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        
        {/* SMTP Configuration */}
        <form onSubmit={handleSaveSmtp} className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SMTP Configuration</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Configure email server for sending notifications (supports Gmail, custom SMTP server, etc.)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  placeholder="smtp.gmail.com"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="smtp-host-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  placeholder="587"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="smtp-port-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="your-email@gmail.com"
                  value={smtpConfig.username}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="smtp-username-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="smtp-password-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  From Email
                </label>
                <input
                  type="email"
                  placeholder="noreply@yourdomain.com"
                  value={smtpConfig.from_email}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, from_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="smtp-from-email-input"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="useTls"
                  checked={smtpConfig.use_tls}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, use_tls: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  data-testid="smtp-use-tls-checkbox"
                />
                <label htmlFor="useTls" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Use TLS/SSL
                </label>
              </div>
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                data-testid="save-smtp-button"
              >
                Save SMTP Config
              </button>
            </div>
          </div>
        </form>
        
        {/* Test Email */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Test Email</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Send a test email to verify your SMTP configuration
          </p>
          
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="recipient@example.com"
              value={testEmailRecipient}
              onChange={(e) => setTestEmailRecipient(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="test-email-recipient-input"
            />
            <button
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              data-testid="send-test-email-button"
            >
              {testingEmail ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Test Email
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Email Templates */}
        <form onSubmit={handleSaveTemplates}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email Notification Templates</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Customize email templates for different notification types. Available variables: 
              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ml-1">
                {'{'}{'{'} sensor_name {'}'}{'}'}
              </span>
              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ml-1">
                {'{'}{'{'} location {'}'}{'}'}
              </span>
              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ml-1">
                {'{'}{'{'} timestamp {'}'}{'}'}
              </span>
            </p>
            
            {/* Alarm Template */}
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                🚨 Alarm Triggered Template
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailTemplates.alarm.subject}
                    onChange={(e) => setEmailTemplates({
                      ...emailTemplates,
                      alarm: { ...emailTemplates.alarm, subject: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="alarm-template-subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Body
                  </label>
                  <textarea
                    rows="4"
                    value={emailTemplates.alarm.body}
                    onChange={(e) => setEmailTemplates({
                      ...emailTemplates,
                      alarm: { ...emailTemplates.alarm, body: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="alarm-template-body"
                  />
                </div>
              </div>
            </div>
            
            {/* Sensor Offline Template */}
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                ⚠️ Sensor Offline Template
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailTemplates.sensor_offline.subject}
                    onChange={(e) => setEmailTemplates({
                      ...emailTemplates,
                      sensor_offline: { ...emailTemplates.sensor_offline, subject: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="sensor-offline-template-subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Body
                  </label>
                  <textarea
                    rows="4"
                    value={emailTemplates.sensor_offline.body}
                    onChange={(e) => setEmailTemplates({
                      ...emailTemplates,
                      sensor_offline: { ...emailTemplates.sensor_offline, body: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="sensor-offline-template-body"
                  />
                </div>
              </div>
            </div>
            
            {/* System Change Template */}
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                ℹ️ System Change Template
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailTemplates.system_change.subject}
                    onChange={(e) => setEmailTemplates({
                      ...emailTemplates,
                      system_change: { ...emailTemplates.system_change, subject: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="system-change-template-subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Body
                  </label>
                  <textarea
                    rows="4"
                    value={emailTemplates.system_change.body}
                    onChange={(e) => setEmailTemplates({
                      ...emailTemplates,
                      system_change: { ...emailTemplates.system_change, body: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="system-change-template-body"
                  />
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              data-testid="save-templates-button"
            >
              Save Email Templates
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}