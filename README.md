# 🚨 IoT Alarm System Dashboard

Dashboard monitoring dan kontrol untuk 13 sensor pintu dengan sistem alarm real-time. Dirancang sebagai pengganti platform Blynk.

## 📋 Fitur Utama

### 1. **Dashboard Real-time Monitoring**
- Monitor status 13 sensor pintu secara real-time
- Visual cards untuk setiap sensor dengan informasi lokasi
- Statistics overview (Total, Active, Inactive, In Alarm)
- Auto-refresh setiap 5 detik

### 2. **Control Panel**
- **On/Off Control**: Individual dan global enable/disable sensors
- **Volume Control**: Atur volume buzzer per sensor atau semua sensor sekaligus
- **Global Controls**: Control semua sensor dengan satu klik

### 3. **Alarm System**
- Trigger alarm otomatis ketika pintu terbuka > 10 detik
- Visual notification dengan animasi (pulsing red badge)
- Banner alarm aktif di dashboard
- History alarm dengan filter (Active/Resolved)
- Resolve alarm functionality

### 4. **Audit Logs**
- Comprehensive logging semua aktivitas:
  - Login/Logout events
  - Sensor control changes (enable/disable, volume)
  - Alarm triggers dan resolutions
  - User management actions
- Filter by action type dan username
- Sortir by timestamp (newest first)

### 5. **User Management** (Admin Only)
- Create new users (Admin atau Operator role)
- Delete users
- View all users dengan role badges
- Role-based access control

### 6. **Security & Authentication**
- JWT-based authentication
- Password hashing dengan bcrypt
- Role-based authorization (Admin & Operator)
- Session management

## 🚀 Quick Start

### Login Credentials
```
Username: admin
Password: admin123
Role: Admin (full access)
```

### Akses Dashboard
```
URL: https://control-center-89.preview.emergentagent.com
```

## 🏗️ Arsitektur Sistem

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── server.py          # Main application dengan semua endpoints
├── requirements.txt   # Python dependencies
└── .env              # Environment variables
```

**API Endpoints:**
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user
- `GET /api/sensors` - List all sensors
- `POST /api/sensors` - Create sensor (admin)
- `PATCH /api/sensors/{id}` - Update sensor
- `POST /api/sensors/bulk-control` - Bulk control sensors
- `GET /api/alarms` - List alarm events
- `POST /api/alarms` - Create alarm event
- `PATCH /api/alarms/{id}/resolve` - Resolve alarm
- `GET /api/audit-logs` - List audit logs
- `GET /api/users` - List users (admin)
- `POST /api/users` - Create user (admin)
- `DELETE /api/users/{id}` - Delete user (admin)

### Frontend (React + Tailwind CSS)
```
/app/frontend/src/
├── App.js                    # Main routing
├── components/
│   ├── Login.js             # Login page
│   ├── Navbar.js            # Navigation bar
│   ├── Dashboard.js         # Main dashboard
│   ├── SensorCard.js        # Individual sensor card
│   ├── AlarmHistory.js      # Alarm history table
│   ├── AuditLogs.js         # Audit logs table
│   └── UserManagement.js    # User management (admin)
└── components/ui/           # Reusable UI components
```

### Database (MongoDB)
**Collections:**
- `users` - User accounts dengan authentication
- `sensors` - Sensor data dan status
- `alarm_events` - Alarm triggers dan resolutions
- `audit_logs` - Comprehensive activity logs

## 📊 Sensor Default

13 sensor pintu sudah dibuat otomatis:
1. Door 1 - Main Entrance
2. Door 2 - Back Entrance
3. Door 3 - Building A - Floor 1
4. Door 4 - Building A - Floor 2
5. Door 5 - Building B - Floor 1
6. Door 6 - Building B - Floor 2
7. Door 7 - Warehouse - East
8. Door 8 - Warehouse - West
9. Door 9 - Office - Room 101
10. Door 10 - Office - Room 102
11. Door 11 - Emergency Exit - North
12. Door 12 - Emergency Exit - South
13. Door 13 - Storage Room

## 🎯 User Roles & Permissions

### Admin Role
- ✅ Monitor semua sensors
- ✅ Control sensors (on/off, volume)
- ✅ View alarm history
- ✅ View audit logs
- ✅ User management (create/delete users)
- ✅ Sensor management (create/delete sensors)

### Operator Role
- ✅ Monitor semua sensors
- ✅ Control sensors (on/off, volume)
- ✅ View alarm history
- ✅ View audit logs
- ❌ User management (restricted)
- ❌ Sensor management (restricted)

## 🎨 UI/UX Features

- **Clean & Intuitive**: Simple interface untuk operator
- **Responsive Design**: Bekerja di desktop, tablet, dan mobile
- **Real-time Updates**: Auto-refresh tanpa reload page
- **Visual Feedback**: Color-coded status (green=closed, yellow=open, red=alarm)
- **Accessibility**: Proper testid attributes untuk testing
- **Professional Design**: Modern gradient backgrounds dan smooth animations

## 🔧 Cara Menggunakan

### 1. Monitor Sensors
- Login ke dashboard
- View status semua 13 sensors di main page
- Check statistics cards di atas untuk overview

### 2. Control Individual Sensor
- Click toggle switch untuk enable/disable sensor
- Adjust volume slider (0-100%)
- Click "Apply" button untuk update volume

### 3. Control Semua Sensors Sekaligus
- Gunakan "Global Controls" section
- Click "Enable All" atau "Disable All"
- Set global volume dengan slider
- Click "Apply to All" untuk apply ke semua sensors

### 4. View Alarm History
- Click "Alarm History" di navigation
- Filter by status (All/Active/Resolved)
- Resolve active alarms dengan click "Resolve" button

### 5. View Audit Logs
- Click "Audit Logs" di navigation
- Filter by action type atau username
- View comprehensive activity history

### 6. User Management (Admin Only)
- Click "User Management" di navigation
- Click "+ Create User" untuk add user baru
- Pilih role (Admin atau Operator)
- Delete users dengan click "Delete" button

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt encryption
- **Role-Based Access**: Admin vs Operator permissions
- **Session Management**: Persistent login with localStorage
- **CORS Protection**: Configured CORS middleware
- **Audit Logging**: All actions logged with timestamp

## 📱 Responsive Design

Dashboard fully responsive untuk:
- 🖥️ Desktop (1920x1080+)
- 💻 Laptop (1366x768+)
- 📱 Tablet (768x1024+)
- 📱 Mobile (375x667+)

## 🚀 Development

### Backend
```bash
cd /app/backend
pip install -r requirements.txt
python server.py
```

### Frontend
```bash
cd /app/frontend
yarn install
yarn start
```

### Services Status
```bash
sudo supervisorctl status
sudo supervisorctl restart all
```

## 📝 Technical Stack

- **Backend**: FastAPI 0.110.1, Python 3.11
- **Database**: MongoDB (Motor async driver)
- **Frontend**: React 19, React Router v7
- **UI Framework**: Tailwind CSS, Radix UI
- **Authentication**: JWT (python-jose), Bcrypt
- **Date Handling**: date-fns
- **HTTP Client**: Axios

## 🎯 Future Enhancements (Sesuai PDF)

- [ ] Real-time WebSocket notifications untuk alarms
- [ ] Email/SMS notifications
- [ ] Integration dengan ESP8266 sensors
- [ ] Over-the-Air (OTA) firmware updates
- [ ] Charts dan analytics (sensor activity trends)
- [ ] Configurable alarm threshold (default: 10 seconds)
- [ ] Export audit logs ke CSV/PDF
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## 📞 Support

Untuk pertanyaan atau issue, hubungi tim development atau buka ticket di issue tracker.

## 📄 License

Proprietary - Internal Use Only

---

**Made with ❤️ for PT. Ching Luh - Replacing Blynk Platform**
