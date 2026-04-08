import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Bell, 
  FileText, 
  Settings, 
  Wrench,
  Users, 
  Shield,
  Palette,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ user, isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [logo, setLogo] = useState('');

  useEffect(() => {
    // Load logo from localStorage
    const savedSettings = localStorage.getItem('websiteSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setLogo(settings.siteLogo || '');
    }
  }, []);

  useEffect(() => {
    // Listen for storage changes
    const handleStorageChange = () => {
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setLogo(settings.siteLogo || '');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-page updates
    window.addEventListener('websiteSettingsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteSettingsUpdated', handleStorageChange);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      section: 'Main',
      items: [
        { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
        { path: '/alarms', label: 'Alarm History', Icon: Bell },
        { path: '/audit-logs', label: 'Audit Logs', Icon: FileText },
      ]
    },
    {
      section: 'Management',
      items: [
        { path: '/sensor-management', label: 'Sensor Management', Icon: Wrench },
        { path: '/alarm-settings', label: 'Alarm Settings', Icon: Settings },
      ]
    },
  ];

  if (user.role === 'admin') {
    menuItems.push({
      section: 'Administration',
      items: [
        { path: '/users', label: 'User Management', Icon: Users },
        { path: '/permissions', label: 'Permissions & Roles', Icon: Shield },
        { path: '/website-settings', label: 'Website Settings', Icon: Palette },
        { path: '/system-settings', label: 'System Settings', Icon: Settings },
      ]
    });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-30 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
        data-testid="sidebar"
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              {logo ? (
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <>
                  <div className="bg-white text-blue-900 rounded-lg p-2">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">IoT Alarm</h1>
                    <p className="text-xs text-blue-200">Control System</p>
                  </div>
                </>
              )}
            </div>
          )}
          {isCollapsed && logo && (
            <img 
              src={logo} 
              alt="Logo" 
              className="h-10 w-10 object-contain mx-auto"
            />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors hidden lg:block"
            data-testid="sidebar-toggle"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors lg:hidden"
            data-testid="mobile-close-button"
          >
            <X className="w-5 h-5" />
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
                {section.items.map((item) => {
                  const Icon = item.Icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-700 border-r-4 border-white'
                          : 'hover:bg-blue-700/50'
                      } ${isCollapsed ? 'lg:justify-center' : ''}`}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className={`text-sm font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-4 right-4 lg:hidden bg-blue-600 text-white p-4 rounded-full shadow-lg z-10 hover:bg-blue-700 transition-colors"
          data-testid="mobile-menu-button"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </>
  );
}