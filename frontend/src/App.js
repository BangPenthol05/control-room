import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import Login from '@/components/Login';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import AlarmHistory from '@/components/AlarmHistory';
import AuditLogs from '@/components/AuditLogs';
import UserManagement from '@/components/UserManagement';
import SensorManagement from '@/components/SensorManagement';
import AlarmSettings from '@/components/AlarmSettings';
import SystemSettings from '@/components/SystemSettings';
import PermissionsSettings from '@/components/PermissionsSettings';
import WebsiteSettings from '@/components/WebsiteSettings';
import Profile from '@/components/Profile';
import '@/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DarkModeProvider>
      <BrowserRouter>
        <div className="App">
          {user ? (
            <Layout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/alarms" element={<AlarmHistory user={user} />} />
                <Route path="/audit-logs" element={<AuditLogs user={user} />} />
                <Route path="/sensor-management" element={<SensorManagement user={user} />} />
                <Route path="/alarm-settings" element={<AlarmSettings user={user} />} />
                <Route path="/profile" element={<Profile user={user} />} />
                {user.role === 'admin' && (
                  <>
                    <Route path="/users" element={<UserManagement user={user} />} />
                    <Route path="/permissions" element={<PermissionsSettings user={user} />} />
                    <Route path="/website-settings" element={<WebsiteSettings user={user} />} />
                    <Route path="/system-settings" element={<SystemSettings user={user} />} />
                  </>
                )}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          ) : (
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </div>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;
