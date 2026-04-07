export default function Profile({ user }) {
  return (
    <div className="p-6" data-testid="profile-container">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.username}</h2>
              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'admin' ? 'Administrator' : 'Operator'}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
              <p className="text-gray-600 mb-4">
                {user.role === 'admin' 
                  ? 'Full system access with administrative privileges'
                  : 'Monitoring and control access to alarm system'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">User ID</span>
              <span className="text-sm text-gray-900 font-mono">{user.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Username</span>
              <span className="text-sm text-gray-900">{user.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Role</span>
              <span className="text-sm text-gray-900 capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Account Created</span>
              <span className="text-sm text-gray-900">{new Date(user.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium text-gray-700">Account Status</span>
              <span className="text-sm text-green-600 font-semibold">Active</span>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
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

        {/* Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> To change your password or update account information, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

function PermissionItem({ allowed, text }) {
  return (
    <div className="flex items-center space-x-2">
      {allowed ? (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <span className={`text-sm ${allowed ? 'text-gray-900' : 'text-gray-400'}`}>
        {text}
      </span>
    </div>
  );
}