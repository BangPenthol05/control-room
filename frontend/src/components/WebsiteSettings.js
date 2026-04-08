import { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw, Globe, Sparkles, Moon, Upload, Image } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function WebsiteSettings({ user }) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [settings, setSettings] = useState({
    // Meta Settings
    siteTitle: 'IoT Alarm System',
    siteDescription: 'Real-time door sensor monitoring and control system',
    siteFavicon: '',
    siteLogo: '', // Logo URL or base64
    
    // Color Theme
    primaryColor: '#2563eb', // blue-600
    secondaryColor: '#10b981', // green-500
    accentColor: '#f59e0b', // amber-500
    dangerColor: '#ef4444', // red-500
    successColor: '#22c55e', // green-500
    
    // Layout
    sidebarColor: '#1e3a8a', // blue-900
    navbarColor: '#ffffff', // white
    
    // Advanced
    enableDarkMode: false,
    compactMode: false,
  });
  
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('websiteSettings');
    if (saved) {
      setSettings({ ...settings, ...JSON.parse(saved) });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('websiteSettings', JSON.stringify(settings));
    toggleDarkMode(settings.enableDarkMode);
    applyTheme();
    
    // Dispatch custom event untuk update logo di sidebar
    window.dispatchEvent(new Event('websiteSettingsUpdated'));
    
    setSuccessMessage('Website settings saved successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleReset = () => {
    const defaultSettings = {
      siteTitle: 'IoT Alarm System',
      siteDescription: 'Real-time door sensor monitoring and control system',
      siteFavicon: '',
      siteLogo: '',
      primaryColor: '#2563eb',
      secondaryColor: '#10b981',
      accentColor: '#f59e0b',
      dangerColor: '#ef4444',
      successColor: '#22c55e',
      sidebarColor: '#1e3a8a',
      navbarColor: '#ffffff',
      enableDarkMode: false,
      compactMode: false,
    };
    setSettings(defaultSettings);
    localStorage.setItem('websiteSettings', JSON.stringify(defaultSettings));
    applyTheme();
    setSuccessMessage('Settings reset to default');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const applyTheme = () => {
    // Apply colors to CSS variables
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    document.documentElement.style.setProperty('--danger-color', settings.dangerColor);
    document.documentElement.style.setProperty('--success-color', settings.successColor);
    
    // Update page title
    document.title = settings.siteTitle;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', settings.siteDescription);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, siteLogo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const ColorPicker = ({ label, value, onChange, description }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="#000000"
        />
        <div 
          className="w-10 h-10 rounded-lg border-2 border-gray-300"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6" data-testid="website-settings-container">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Palette className="w-8 h-8 mr-3 text-pink-600" />
            Website Settings
          </h1>
          <p className="text-gray-600 mt-1">Customize website appearance and metadata</p>
        </div>

        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center" data-testid="success-message">
            <Sparkles className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Meta Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Meta Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Title
                </label>
                <input
                  type="text"
                  data-testid="site-title-input"
                  value={settings.siteTitle}
                  onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="IoT Alarm System"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Description
                </label>
                <textarea
                  data-testid="site-description-input"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your website..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Favicon URL (Optional)
                </label>
                <input
                  type="url"
                  data-testid="favicon-url-input"
                  value={settings.siteFavicon}
                  onChange={(e) => setSettings({ ...settings, siteFavicon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/favicon.ico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Website
                </label>
                
                {/* Logo Preview */}
                {settings.siteLogo && (
                  <div className="mb-3 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                    <img 
                      src={settings.siteLogo} 
                      alt="Website Logo" 
                      className="max-h-20 max-w-full object-contain"
                    />
                  </div>
                )}
                
                {/* Upload Button */}
                <div className="flex items-center space-x-3 mb-3">
                  <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      data-testid="logo-upload-input"
                    />
                  </label>
                  {settings.siteLogo && (
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, siteLogo: '' })}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Hapus Logo
                    </button>
                  )}
                </div>
                
                {/* Or URL Input */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">atau</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <input
                    type="url"
                    data-testid="logo-url-input"
                    value={settings.siteLogo && settings.siteLogo.startsWith('http') ? settings.siteLogo : ''}
                    onChange={(e) => setSettings({ ...settings, siteLogo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Masukkan URL logo atau upload file (maks. 2MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Color Theme */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Color Theme
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorPicker
                label="Primary Color"
                description="Main brand color for buttons and links"
                value={settings.primaryColor}
                onChange={(val) => setSettings({ ...settings, primaryColor: val })}
              />
              <ColorPicker
                label="Secondary Color"
                description="Secondary accent color"
                value={settings.secondaryColor}
                onChange={(val) => setSettings({ ...settings, secondaryColor: val })}
              />
              <ColorPicker
                label="Accent Color"
                description="Highlight and emphasis color"
                value={settings.accentColor}
                onChange={(val) => setSettings({ ...settings, accentColor: val })}
              />
              <ColorPicker
                label="Danger Color"
                description="Errors and critical alerts"
                value={settings.dangerColor}
                onChange={(val) => setSettings({ ...settings, dangerColor: val })}
              />
              <ColorPicker
                label="Success Color"
                description="Success messages and confirmations"
                value={settings.successColor}
                onChange={(val) => setSettings({ ...settings, successColor: val })}
              />
            </div>
          </div>

          {/* Layout Colors */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Layout Colors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorPicker
                label="Sidebar Color"
                description="Navigation sidebar background"
                value={settings.sidebarColor}
                onChange={(val) => setSettings({ ...settings, sidebarColor: val })}
              />
              <ColorPicker
                label="Top Navbar Color"
                description="Top navigation bar background"
                value={settings.navbarColor}
                onChange={(val) => setSettings({ ...settings, navbarColor: val })}
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Options</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center">
                    <Moon className="w-4 h-4 mr-2" />
                    Dark Mode
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Enable dark theme for the entire application</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableDarkMode}
                    onChange={(e) => {
                      setSettings({ ...settings, enableDarkMode: e.target.checked });
                      toggleDarkMode(e.target.checked);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Compact Mode</p>
                  <p className="text-sm text-gray-600">Reduce spacing for denser layout</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              data-testid="save-website-settings-button"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Save Settings</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              data-testid="reset-website-settings-button"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset to Default</span>
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Some changes may require a page refresh to take full effect. Theme colors will be applied immediately after saving.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
