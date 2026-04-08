"""
Backend API Tests for IoT Alarm System
Testing: Notifications, SMTP Config, Email Templates endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuth:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for admin user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        return data["access_token"]
    
    def test_login_success(self):
        """Test successful login with admin credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["username"] == "admin"
        assert data["user"]["role"] == "admin"
        print("Login test passed")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("Invalid login test passed")


class TestNotifications:
    """Notification endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_notifications(self, auth_headers):
        """Test GET /api/notifications - should return list with proper fields"""
        response = requests.get(f"{BASE_URL}/api/notifications", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If there are notifications, verify structure
        if len(data) > 0:
            notif = data[0]
            assert "id" in notif
            assert "type" in notif
            assert "title" in notif
            assert "message" in notif
            assert "read" in notif
            assert "created_at" in notif
            assert "time_ago" in notif
            print(f"Notifications returned: {len(data)} items with correct structure")
        else:
            print("No notifications found (empty list is valid)")
    
    def test_get_notifications_unread_only(self, auth_headers):
        """Test GET /api/notifications with unread_only filter"""
        response = requests.get(f"{BASE_URL}/api/notifications?unread_only=true", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned notifications should be unread
        for notif in data:
            assert notif["read"] == False
        print(f"Unread notifications filter works: {len(data)} unread")
    
    def test_mark_all_notifications_read(self, auth_headers):
        """Test POST /api/notifications/mark-all-read"""
        response = requests.post(f"{BASE_URL}/api/notifications/mark-all-read", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("Mark all as read endpoint works")
    
    def test_notifications_unauthorized(self):
        """Test notifications endpoint without auth"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code in [401, 403]
        print("Unauthorized access properly blocked")


class TestSmtpConfig:
    """SMTP Configuration endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_smtp_config(self, auth_headers):
        """Test GET /api/settings/smtp - should return config or defaults"""
        response = requests.get(f"{BASE_URL}/api/settings/smtp", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify expected fields exist
        assert "host" in data
        assert "port" in data
        assert "username" in data
        assert "password" in data
        assert "from_email" in data
        assert "use_tls" in data
        
        # Port should be integer
        assert isinstance(data["port"], int)
        # use_tls should be boolean
        assert isinstance(data["use_tls"], bool)
        print(f"SMTP config returned: host={data['host']}, port={data['port']}")
    
    def test_save_smtp_config(self, auth_headers):
        """Test POST /api/settings/smtp - save SMTP configuration"""
        smtp_config = {
            "host": "smtp.test.com",
            "port": 587,
            "username": "test@test.com",
            "password": "testpassword",
            "from_email": "noreply@test.com",
            "use_tls": True
        }
        response = requests.post(f"{BASE_URL}/api/settings/smtp", json=smtp_config, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("SMTP config saved successfully")
        
        # Verify it was saved by fetching again
        get_response = requests.get(f"{BASE_URL}/api/settings/smtp", headers=auth_headers)
        assert get_response.status_code == 200
        saved_data = get_response.json()
        assert saved_data["host"] == "smtp.test.com"
        assert saved_data["port"] == 587
        print("SMTP config persistence verified")
    
    def test_smtp_config_unauthorized(self):
        """Test SMTP config endpoint without auth"""
        response = requests.get(f"{BASE_URL}/api/settings/smtp")
        assert response.status_code in [401, 403]
        print("SMTP config unauthorized access blocked")


class TestEmailTemplates:
    """Email Templates endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_email_templates(self, auth_headers):
        """Test GET /api/settings/email-templates - should return 3 templates"""
        response = requests.get(f"{BASE_URL}/api/settings/email-templates", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify all 3 templates exist
        assert "alarm" in data
        assert "sensor_offline" in data
        assert "system_change" in data
        
        # Verify each template has subject and body
        for template_name in ["alarm", "sensor_offline", "system_change"]:
            template = data[template_name]
            assert "subject" in template, f"{template_name} missing subject"
            assert "body" in template, f"{template_name} missing body"
            assert isinstance(template["subject"], str)
            assert isinstance(template["body"], str)
        
        print("Email templates returned with correct structure")
    
    def test_save_email_templates(self, auth_headers):
        """Test POST /api/settings/email-templates - save templates"""
        templates = {
            "alarm": {
                "subject": "TEST - Alarm Triggered - {{sensor_name}}",
                "body": "Test alarm body for {{sensor_name}} at {{location}}"
            },
            "sensor_offline": {
                "subject": "TEST - Sensor Offline - {{sensor_name}}",
                "body": "Test sensor offline body"
            },
            "system_change": {
                "subject": "TEST - System Change",
                "body": "Test system change body"
            }
        }
        response = requests.post(f"{BASE_URL}/api/settings/email-templates", json=templates, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("Email templates saved successfully")
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/settings/email-templates", headers=auth_headers)
        assert get_response.status_code == 200
        saved_data = get_response.json()
        assert saved_data["alarm"]["subject"] == "TEST - Alarm Triggered - {{sensor_name}}"
        print("Email templates persistence verified")
    
    def test_email_templates_unauthorized(self):
        """Test email templates endpoint without auth"""
        response = requests.get(f"{BASE_URL}/api/settings/email-templates")
        assert response.status_code in [401, 403]
        print("Email templates unauthorized access blocked")


class TestTestEmail:
    """Test Email endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_send_test_email_no_smtp_config(self, auth_headers):
        """Test POST /api/settings/test-email - should fail gracefully without valid SMTP"""
        # First clear SMTP config by setting empty host
        smtp_config = {
            "host": "",
            "port": 587,
            "username": "",
            "password": "",
            "from_email": "",
            "use_tls": True
        }
        requests.post(f"{BASE_URL}/api/settings/smtp", json=smtp_config, headers=auth_headers)
        
        # Now try to send test email
        response = requests.post(f"{BASE_URL}/api/settings/test-email", 
                                json={"recipient": "test@example.com"}, 
                                headers=auth_headers)
        # Should return 400 because SMTP not configured
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "SMTP" in data["detail"] or "configuration" in data["detail"].lower()
        print("Test email properly fails when SMTP not configured")
    
    def test_test_email_unauthorized(self):
        """Test test-email endpoint without auth"""
        response = requests.post(f"{BASE_URL}/api/settings/test-email", 
                                json={"recipient": "test@example.com"})
        assert response.status_code in [401, 403]
        print("Test email unauthorized access blocked")


class TestAlarmNotificationCreation:
    """Test that alarms create notifications"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_alarm_creates_notification(self, auth_headers):
        """Test that creating an alarm also creates a notification"""
        # Get initial notification count
        initial_response = requests.get(f"{BASE_URL}/api/notifications", headers=auth_headers)
        initial_count = len(initial_response.json())
        
        # Get a sensor to create alarm for
        sensors_response = requests.get(f"{BASE_URL}/api/sensors", headers=auth_headers)
        sensors = sensors_response.json()
        if len(sensors) > 0:
            sensor = sensors[0]
            
            # Create an alarm
            alarm_data = {
                "sensor_id": sensor["id"],
                "sensor_name": sensor["name"],
                "sensor_location": sensor["location"]
            }
            alarm_response = requests.post(f"{BASE_URL}/api/alarms", json=alarm_data, headers=auth_headers)
            assert alarm_response.status_code == 200
            
            # Check notifications increased
            new_response = requests.get(f"{BASE_URL}/api/notifications", headers=auth_headers)
            new_count = len(new_response.json())
            
            assert new_count > initial_count, "Notification should be created when alarm is triggered"
            print(f"Alarm notification created: {initial_count} -> {new_count}")
        else:
            pytest.skip("No sensors available for alarm test")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
