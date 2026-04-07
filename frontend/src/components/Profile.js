import { useState } from 'react';
import { User, Shield, Camera, Key, Smartphone } from 'lucide-react';

export default function Profile({ user }) {
  const [activeTab, setActiveTab] = useState('information');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        localStorage.setItem(`profilePhoto_${user.id}`, reader.result);
        setSuccessMessage('Profile photo updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setError('');

    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // In production, this would call an API endpoint
    setSuccessMessage('Password changed successfully');
    setPasswords({ current: '', new: '', confirm: '' });
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  // Load saved photo on mount
  useState(() => {
    const savedPhoto = localStorage.getItem(`profilePhoto_${user.id}`);
    if (savedPhoto) {
      setPhotoPreview(savedPhoto);
    }
  }, [user.id]);

  return (
    <div className="p-6" data-testid="profile-container">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">View and manage your account information</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('information')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'information'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
              data-testid="tab-information"
            >
              <User className="w-5 h-5" />
              <span>Information</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
              data-testid="tab-security"
            >
              <Shield className="w-5 h-5" />
              <span>Security</span>
            </button>
          </nav>
        </div>

        {/* Information Tab */}
        {activeTab === 'information' && (
          <div className="space-y-6">
            {/* Profile Photo Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Profile Photo
              </h3>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                      {getInitials(user.username)}
                    </div>
                  )}
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      data-testid="photo-upload-input"
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Click the camera icon to upload a new photo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">User ID</span>
                  <span className="text-sm text-gray-900 dark:text-white font-mono">{user.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Username</span>
                  <span className="text-sm text-gray-900 dark:text-white">{user.username}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Role</span>
                  <span className="text-sm text-gray-900 dark:text-white capitalize">{user.role}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Account Created</span>
                  <span className="text-sm text-gray-900 dark:text-white">{new Date(user.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Account Status</span>
                  <span className="text-sm text-green-600 dark:text-green-400 font-semibold">Active</span>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <PermissionItem allowed={true} text="Monitor sensor status" />
                <PermissionItem allowed={true} text="Control sensors" />
                <PermissionItem allowed={true} text="View alarm history" />
                <PermissionItem allowed={true} text="View audit logs" />
                <PermissionItem allowed={user.role === 'admin'} text="Manage sensors" />
                <PermissionItem allowed={user.role === 'admin'} text="Manage users" />
                <PermissionItem allowed={user.role === 'admin'} text="System settings" />
                <PermissionItem allowed={user.role === 'admin'} text="Delete data" />
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Change Password
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                    data-testid="current-password-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                    data-testid="new-password-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                    data-testid="confirm-password-input"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  data-testid="change-password-button"
                >
                  Change Password
                </button>
              </form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Two-Factor Authentication
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">2FA Status</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Not enabled</p>
                  </div>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-testid="enable-2fa-button"
                  >
                    Enable 2FA
                  </button>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> 2FA feature requires integration with an authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Session Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Current Device</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last active: Just now</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PermissionItem({ allowed, text }) {
  return (
    <div className="flex items-center space-x-2">
      {allowed ? (
        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <span className={`text-sm ${allowed ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
        {text}
      </span>
    </div>
  );
}
