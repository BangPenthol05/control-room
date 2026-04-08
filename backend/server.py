from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from email_validator import validate_email, EmailNotValidError
import phonenumbers
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = "operator"  # admin or operator
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = "operator"
    
    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v):
        if v and v.strip():
            try:
                validate_email(v)
                return v
            except EmailNotValidError:
                raise ValueError('Format email tidak valid')
        return v
    
    @field_validator('phone')
    @classmethod
    def validate_phone_format(cls, v):
        if v and v.strip():
            try:
                parsed = phonenumbers.parse(v, None)
                if not phonenumbers.is_valid_number(parsed):
                    raise ValueError('Format nomor telepon tidak valid')
                return v
            except Exception:
                raise ValueError('Format nomor telepon tidak valid')
        return v

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    
    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v):
        if v and v.strip():
            try:
                validate_email(v)
                return v
            except EmailNotValidError:
                raise ValueError('Format email tidak valid')
        return v
    
    @field_validator('phone')
    @classmethod
    def validate_phone_format(cls, v):
        if v and v.strip():
            try:
                parsed = phonenumbers.parse(v, None)
                if not phonenumbers.is_valid_number(parsed):
                    raise ValueError('Format nomor telepon tidak valid')
                return v
            except Exception:
                raise ValueError('Format nomor telepon tidak valid')
        return v

class ResetPasswordRequest(BaseModel):
    new_password: str

class UserResponse(BaseModel):
    id: str
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    created_at: datetime

# ==================== NOTIFICATION SCHEMAS ====================

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # alarm, sensor, system
    title: str
    message: str
    related_id: Optional[str] = None  # sensor_id or alarm_id
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    related_id: Optional[str] = None
    read: bool
    created_at: datetime
    time_ago: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class Sensor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: str
    esp8266_mac: Optional[str] = None  # ESP8266 MAC address
    status: str = "closed"  # open, closed, alarm
    current_volume: int = 50  # 0-100
    is_enabled: bool = True
    last_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SensorCreate(BaseModel):
    name: str
    location: str
    esp8266_mac: Optional[str] = None
    current_volume: int = 50
    is_enabled: bool = True

class SensorUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    esp8266_mac: Optional[str] = None
    status: Optional[str] = None
    current_volume: Optional[int] = None
    is_enabled: Optional[bool] = None

class BulkControl(BaseModel):
    sensor_ids: List[str]
    action: str  # "enable", "disable", "volume"
    value: Optional[int] = None  # for volume control

class AlarmEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sensor_id: str
    sensor_name: str
    sensor_location: str
    triggered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = None
    duration: Optional[int] = None  # in seconds
    status: str = "active"  # active, resolved

class AlarmEventCreate(BaseModel):
    sensor_id: str
    sensor_name: str
    sensor_location: str

class AlarmEventResolve(BaseModel):
    ended_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AuditLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    username: Optional[str] = None
    action_type: str  # login, logout, volume_change, sensor_enable, sensor_disable, alarm_triggered, etc.
    target_type: Optional[str] = None  # user, sensor, alarm
    target_id: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_address: Optional[str] = None
    details: Optional[str] = None

class AuditLogCreate(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    action_type: str
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[str] = None

# ==================== AUTH HELPERS ====================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise credentials_exception
    
    # Convert ISO string timestamp back to datetime
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)

async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

async def create_audit_log(log_data: AuditLogCreate):
    log_obj = AuditLog(**log_data.model_dump())
    doc = log_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.audit_logs.insert_one(doc)

# ==================== NOTIFICATION HELPERS ====================

def get_time_ago(dt: datetime) -> str:
    """Convert datetime to human-readable time ago string"""
    now = datetime.now(timezone.utc)
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    
    diff = now - dt
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f"{minutes} min ago" if minutes > 1 else "1 min ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours} hour ago" if hours == 1 else f"{hours} hours ago"
    else:
        days = int(seconds / 86400)
        return f"{days} day ago" if days == 1 else f"{days} days ago"

async def create_notification(notif_type: str, title: str, message: str, related_id: Optional[str] = None):
    """Create a notification in database"""
    notif = Notification(
        type=notif_type,
        title=title,
        message=message,
        related_id=related_id
    )
    doc = notif.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.notifications.insert_one(doc)
    return notif

# ==================== INITIALIZE DEFAULT DATA ====================

async def initialize_data():
    # Create default admin if not exists
    admin = await db.users.find_one({"username": "admin"})
    if not admin:
        admin_user = User(
            username="admin",
            password_hash=get_password_hash("admin123"),
            role="admin"
        )
        doc = admin_user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        logging.info("Default admin user created: admin/admin123")
    
    # Create 13 default sensors if not exists
    sensor_count = await db.sensors.count_documents({})
    if sensor_count == 0:
        sensor_names = [
            ("Door 1", "Main Entrance"),
            ("Door 2", "Back Entrance"),
            ("Door 3", "Building A - Floor 1"),
            ("Door 4", "Building A - Floor 2"),
            ("Door 5", "Building B - Floor 1"),
            ("Door 6", "Building B - Floor 2"),
            ("Door 7", "Warehouse - East"),
            ("Door 8", "Warehouse - West"),
            ("Door 9", "Office - Room 101"),
            ("Door 10", "Office - Room 102"),
            ("Door 11", "Emergency Exit - North"),
            ("Door 12", "Emergency Exit - South"),
            ("Door 13", "Storage Room"),
        ]
        
        for name, location in sensor_names:
            sensor = Sensor(name=name, location=location)
            doc = sensor.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['last_seen'] = doc['last_seen'].isoformat()
            await db.sensors.insert_one(doc)
        
        logging.info("13 default sensors created")

@app.on_event("startup")
async def startup_event():
    await initialize_data()

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/login", response_model=Token)
async def login(user_login: UserLogin):
    user = await db.users.find_one({"username": user_login.username}, {"_id": 0})
    if not user or not verify_password(user_login.password, user["password_hash"]):
        # Create audit log for failed login
        await create_audit_log(AuditLogCreate(
            username=user_login.username,
            action_type="login_failed",
            details=f"Failed login attempt for user: {user_login.username}"
        ))
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # Convert ISO string timestamp back to datetime
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    access_token = create_access_token(data={"sub": user["id"]})
    user_response = UserResponse(**user)
    
    # Create audit log for successful login
    await create_audit_log(AuditLogCreate(
        user_id=user["id"],
        username=user["username"],
        action_type="login_success",
        details=f"User {user['username']} logged in successfully"
    ))
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.model_dump())

# ==================== SENSOR ROUTES ====================

@api_router.get("/sensors", response_model=List[Sensor])
async def get_sensors(current_user: User = Depends(get_current_user)):
    sensors = await db.sensors.find({}, {"_id": 0}).to_list(100)
    
    for sensor in sensors:
        if isinstance(sensor.get('created_at'), str):
            sensor['created_at'] = datetime.fromisoformat(sensor['created_at'])
        if isinstance(sensor.get('last_seen'), str):
            sensor['last_seen'] = datetime.fromisoformat(sensor['last_seen'])
    
    return sensors

@api_router.post("/sensors", response_model=Sensor)
async def create_sensor(sensor_data: SensorCreate, current_user: User = Depends(get_current_admin_user)):
    sensor = Sensor(**sensor_data.model_dump())
    doc = sensor.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['last_seen'] = doc['last_seen'].isoformat()
    await db.sensors.insert_one(doc)
    
    # Create audit log
    await create_audit_log(AuditLogCreate(
        user_id=current_user.id,
        username=current_user.username,
        action_type="sensor_created",
        target_type="sensor",
        target_id=sensor.id,
        details=f"Created sensor: {sensor.name} at {sensor.location}"
    ))
    
    return sensor

@api_router.get("/sensors/{sensor_id}", response_model=Sensor)
async def get_sensor(sensor_id: str, current_user: User = Depends(get_current_user)):
    sensor = await db.sensors.find_one({"id": sensor_id}, {"_id": 0})
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    if isinstance(sensor.get('created_at'), str):
        sensor['created_at'] = datetime.fromisoformat(sensor['created_at'])
    if isinstance(sensor.get('last_seen'), str):
        sensor['last_seen'] = datetime.fromisoformat(sensor['last_seen'])
    
    return Sensor(**sensor)

@api_router.patch("/sensors/{sensor_id}", response_model=Sensor)
async def update_sensor(sensor_id: str, sensor_update: SensorUpdate, current_user: User = Depends(get_current_user)):
    sensor = await db.sensors.find_one({"id": sensor_id}, {"_id": 0})
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    update_data = sensor_update.model_dump(exclude_unset=True)
    update_data['last_seen'] = datetime.now(timezone.utc).isoformat()
    
    # Create audit log
    old_values = []
    new_values = []
    for key, value in update_data.items():
        if key in sensor and sensor[key] != value:
            old_values.append(f"{key}:{sensor[key]}")
            new_values.append(f"{key}:{value}")
    
    if old_values:
        await create_audit_log(AuditLogCreate(
            user_id=current_user.id,
            username=current_user.username,
            action_type="sensor_updated",
            target_type="sensor",
            target_id=sensor_id,
            old_value=", ".join(old_values),
            new_value=", ".join(new_values),
            details=f"Updated sensor: {sensor['name']}"
        ))
        
        # Create notification for important sensor changes
        if 'status' in update_data and update_data['status'] == 'offline':
            await create_notification(
                notif_type="sensor",
                title="⚠️ Sensor Offline",
                message=f"Sensor {sensor['name']} at {sensor['location']} is offline",
                related_id=sensor_id
            )
        elif 'is_enabled' in update_data and not update_data['is_enabled']:
            await create_notification(
                notif_type="system",
                title="ℹ️ Sensor Disabled",
                message=f"Sensor {sensor['name']} has been disabled by {current_user.username}",
                related_id=sensor_id
            )
    
    await db.sensors.update_one({"id": sensor_id}, {"$set": update_data})
    
    updated_sensor = await db.sensors.find_one({"id": sensor_id}, {"_id": 0})
    if isinstance(updated_sensor.get('created_at'), str):
        updated_sensor['created_at'] = datetime.fromisoformat(updated_sensor['created_at'])
    if isinstance(updated_sensor.get('last_seen'), str):
        updated_sensor['last_seen'] = datetime.fromisoformat(updated_sensor['last_seen'])
    
    return Sensor(**updated_sensor)

@api_router.delete("/sensors/{sensor_id}")
async def delete_sensor(sensor_id: str, current_user: User = Depends(get_current_admin_user)):
    sensor = await db.sensors.find_one({"id": sensor_id}, {"_id": 0})
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    await db.sensors.delete_one({"id": sensor_id})
    
    # Create audit log
    await create_audit_log(AuditLogCreate(
        user_id=current_user.id,
        username=current_user.username,
        action_type="sensor_deleted",
        target_type="sensor",
        target_id=sensor_id,
        details=f"Deleted sensor: {sensor['name']}"
    ))
    
    return {"message": "Sensor deleted successfully"}

@api_router.post("/sensors/bulk-control")
async def bulk_control_sensors(control: BulkControl, current_user: User = Depends(get_current_user)):
    update_data = {"last_seen": datetime.now(timezone.utc).isoformat()}
    
    if control.action == "enable":
        update_data["is_enabled"] = True
    elif control.action == "disable":
        update_data["is_enabled"] = False
    elif control.action == "volume" and control.value is not None:
        update_data["current_volume"] = control.value
    else:
        raise HTTPException(status_code=400, detail="Invalid action or missing value")
    
    result = await db.sensors.update_many(
        {"id": {"$in": control.sensor_ids}},
        {"$set": update_data}
    )
    
    # Create audit log
    await create_audit_log(AuditLogCreate(
        user_id=current_user.id,
        username=current_user.username,
        action_type=f"bulk_{control.action}",
        target_type="sensor",
        new_value=str(control.value) if control.value else control.action,
        details=f"Bulk {control.action} applied to {len(control.sensor_ids)} sensors"
    ))
    
    return {"message": f"Updated {result.modified_count} sensors"}

# ==================== ALARM ROUTES ====================

@api_router.get("/alarms", response_model=List[AlarmEvent])
async def get_alarms(
    status: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    query = {}
    if status:
        query["status"] = status
    
    alarms = await db.alarm_events.find(query, {"_id": 0}).sort("triggered_at", -1).to_list(limit)
    
    for alarm in alarms:
        if isinstance(alarm.get('triggered_at'), str):
            alarm['triggered_at'] = datetime.fromisoformat(alarm['triggered_at'])
        if alarm.get('ended_at') and isinstance(alarm['ended_at'], str):
            alarm['ended_at'] = datetime.fromisoformat(alarm['ended_at'])
    
    return alarms

@api_router.post("/alarms", response_model=AlarmEvent)
async def create_alarm(alarm_data: AlarmEventCreate):
    alarm = AlarmEvent(**alarm_data.model_dump())
    doc = alarm.model_dump()
    doc['triggered_at'] = doc['triggered_at'].isoformat()
    await db.alarm_events.insert_one(doc)
    
    # Update sensor status to alarm
    await db.sensors.update_one(
        {"id": alarm_data.sensor_id},
        {"$set": {"status": "alarm", "last_seen": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Create audit log
    await create_audit_log(AuditLogCreate(
        action_type="alarm_triggered",
        target_type="alarm",
        target_id=alarm.id,
        details=f"Alarm triggered for sensor: {alarm_data.sensor_name} at {alarm_data.sensor_location}"
    ))
    
    # Create notification
    await create_notification(
        notif_type="alarm",
        title="🚨 Alarm Triggered",
        message=f"Sensor {alarm_data.sensor_name} at {alarm_data.sensor_location} detected motion",
        related_id=alarm.id
    )
    
    return alarm

@api_router.patch("/alarms/{alarm_id}/resolve", response_model=AlarmEvent)
async def resolve_alarm(alarm_id: str, resolve_data: AlarmEventResolve, current_user: User = Depends(get_current_user)):
    alarm = await db.alarm_events.find_one({"id": alarm_id}, {"_id": 0})
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    triggered_at = datetime.fromisoformat(alarm['triggered_at']) if isinstance(alarm['triggered_at'], str) else alarm['triggered_at']
    duration = int((resolve_data.ended_at - triggered_at).total_seconds())
    
    update_data = {
        "ended_at": resolve_data.ended_at.isoformat(),
        "duration": duration,
        "status": "resolved"
    }
    
    await db.alarm_events.update_one({"id": alarm_id}, {"$set": update_data})
    
    # Update sensor status back to closed
    await db.sensors.update_one(
        {"id": alarm['sensor_id']},
        {"$set": {"status": "closed", "last_seen": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Create audit log
    await create_audit_log(AuditLogCreate(
        user_id=current_user.id,
        username=current_user.username,
        action_type="alarm_resolved",
        target_type="alarm",
        target_id=alarm_id,
        details=f"Alarm resolved for sensor: {alarm['sensor_name']}, duration: {duration}s"
    ))
    
    updated_alarm = await db.alarm_events.find_one({"id": alarm_id}, {"_id": 0})
    if isinstance(updated_alarm.get('triggered_at'), str):
        updated_alarm['triggered_at'] = datetime.fromisoformat(updated_alarm['triggered_at'])
    if updated_alarm.get('ended_at') and isinstance(updated_alarm['ended_at'], str):
        updated_alarm['ended_at'] = datetime.fromisoformat(updated_alarm['ended_at'])
    
    return AlarmEvent(**updated_alarm)

# ==================== AUDIT LOG ROUTES ====================

@api_router.get("/audit-logs", response_model=List[AuditLog])
async def get_audit_logs(
    action_type: Optional[str] = None,
    username: Optional[str] = None,
    limit: int = 500,
    current_user: User = Depends(get_current_user)
):
    query = {}
    if action_type:
        query["action_type"] = action_type
    if username:
        query["username"] = username
    
    logs = await db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    
    for log in logs:
        if isinstance(log.get('timestamp'), str):
            log['timestamp'] = datetime.fromisoformat(log['timestamp'])
    
    return logs

# ==================== NOTIFICATION ROUTES ====================

@api_router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Get notifications for current user"""
    query = {}
    if unread_only:
        query["read"] = False
    
    notifications = await db.notifications.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    
    # Convert to response format with time_ago
    result = []
    for notif in notifications:
        if isinstance(notif.get('created_at'), str):
            created_at = datetime.fromisoformat(notif['created_at'])
        else:
            created_at = notif['created_at']
        
        result.append(NotificationResponse(
            **notif,
            created_at=created_at,
            time_ago=get_time_ago(created_at)
        ))
    
    return result

@api_router.patch("/notifications/{notif_id}/read")
async def mark_notification_read(
    notif_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read"""
    await db.notifications.update_one(
        {"id": notif_id},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

@api_router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(current_user: User = Depends(get_current_user)):
    """Mark all notifications as read"""
    await db.notifications.update_many(
        {"read": False},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}

# ==================== USER MANAGEMENT ROUTES ====================

@api_router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: User = Depends(get_current_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
    
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return users

@api_router.post("/users", response_model=UserResponse)
async def create_user(user_data: UserCreate, current_user: User = Depends(get_current_admin_user)):
    # Check if username already exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user = User(
        username=user_data.username,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        email=user_data.email,
        phone=user_data.phone,
        role=user_data.role
    )
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Create audit log
    await create_audit_log(AuditLogCreate(
        user_id=current_user.id,
        username=current_user.username,
        action_type="user_created",
        target_type="user",
        target_id=user.id,
        details=f"Created user: {user.username} with role: {user.role}"
    ))
    
    return UserResponse(**user.model_dump())

@api_router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_update: UserUpdate, current_user: User = Depends(get_current_admin_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Build update dict with only provided fields
    update_data = {}
    if user_update.username is not None:
        # Check if new username already exists (if changed)
        if user_update.username != user['username']:
            existing = await db.users.find_one({"username": user_update.username})
            if existing:
                raise HTTPException(status_code=400, detail="Username already exists")
        update_data['username'] = user_update.username
    
    if user_update.full_name is not None:
        update_data['full_name'] = user_update.full_name
    if user_update.email is not None:
        update_data['email'] = user_update.email
    if user_update.phone is not None:
        update_data['phone'] = user_update.phone
    if user_update.role is not None:
        update_data['role'] = user_update.role
    
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
        
        # Create audit log
        await create_audit_log(AuditLogCreate(
            user_id=current_user.id,
            username=current_user.username,
            action_type="user_updated",
            target_type="user",
            target_id=user_id,
            details=f"Updated user: {user['username']}"
        ))
    
    # Get updated user
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if isinstance(updated_user.get('created_at'), str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    
    return UserResponse(**updated_user)

@api_router.patch("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: str,
    reset_data: ResetPasswordRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Admin can reset any user's password"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Hash new password
    new_password_hash = get_password_hash(reset_data.new_password)
    
    # Update password
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    # Create audit log
    await create_audit_log(AuditLogCreate(
        user_id=current_user.id,
        username=current_user.username,
        action_type="password_reset",
        target_type="user",
        target_id=user_id,
        details=f"Reset password for user: {user['username']}"
    ))
    
    return {"message": "Password reset successfully"}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_current_admin_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.delete_one({"id": user_id})
    
    # Create audit log
    await create_audit_log(AuditLogCreate(
        user_id=current_user.id,
        username=current_user.username,
        action_type="user_deleted",
        target_type="user",
        target_id=user_id,
        details=f"Deleted user: {user['username']}"
    ))
    
    return {"message": "User deleted successfully"}

# ==================== ROOT ROUTE ====================

@api_router.get("/")
async def root():
    return {"message": "IoT Alarm System API", "version": "1.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
