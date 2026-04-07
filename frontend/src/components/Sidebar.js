import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar({ user }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      section: 'Main',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/alarms', label: 'Alarm History', icon: '🚨' },
        { path: '/audit-logs', label: 'Audit Logs', icon: '📋' },
      ]
    },
    {
      section: 'Management',
      items: [
        { path: '/sensor-management', label: 'Sensor Management', icon: '🔧' },
        { path: '/alarm-settings', label: 'Alarm Settings', icon: '⚙️' },
      ]
    },
  ];

  if (user.role === 'admin') {
    menuItems.push({
      section: 'Administration',
      items: [
        { path: '/users', label: 'User Management', icon: '👥' },
        { path: '/system-settings', label: 'System Settings', icon: '🛠️' },
      ]
    });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-30 ${
          isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-64'
        }`}
        data-testid="sidebar"
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="bg-white text-blue-900 rounded-lg p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold">IoT Alarm</h1>
                <p className="text-xs text-blue-200">Control System</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            data-testid="sidebar-toggle"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="py-4 overflow-y-auto h-[calc(100vh-80px)]">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              {!isCollapsed && (
                <h3 className="px-4 mb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  {section.section}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-700 border-r-4 border-white'
                        : 'hover:bg-blue-700/50'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 right-4 lg:hidden bg-blue-600 text-white p-4 rounded-full shadow-lg z-10"
        data-testid="mobile-menu-button"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}