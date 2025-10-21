# Security Architecture Guide

## Overview

This document outlines the comprehensive security architecture for Bitcorp ERP, implementing defense-in-depth principles and following industry best practices from security-focused literature.

## Security Philosophy

### Core Principles

Based on "Clean Code" and security best practices:

1. **Defense in Depth**: Multiple layers of security controls
2. **Principle of Least Privilege**: Minimal necessary access rights
3. **Fail Secure**: Systems fail to a secure state
4. **Security by Design**: Security integrated from the ground up
5. **Zero Trust**: Never trust, always verify

### Threat Model

#### Assets to Protect
- Customer data and personally identifiable information (PII)
- Equipment records and operational data
- Financial information and reports
- Authentication credentials and session tokens
- System configuration and source code

#### Threat Actors
- External attackers (hackers, competitors)
- Malicious insiders (employees, contractors)
- Accidental data exposure (human error)
- Supply chain attacks (compromised dependencies)

## Authentication Architecture

### JWT Implementation

#### Token Structure

```python
# JWT Configuration
JWT_ALGORITHM = "RS256"  # RSA with SHA-256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
JWT_REFRESH_TOKEN_EXPIRE_DAYS = 7

# Token payload structure
{
    "sub": "user_id",           # Subject (user identifier)
    "iat": 1640995200,          # Issued at timestamp
    "exp": 1640998800,          # Expiration timestamp
    "scope": "read write",       # Permissions scope
    "role": "admin",            # User role
    "session_id": "uuid",       # Session identifier
    "jti": "token_uuid"         # JWT ID for blacklisting
}
```

#### Token Security Measures

```python
# backend/app/core/security.py

import jwt
from datetime import datetime, timedelta
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

class TokenManager:
    def __init__(self):
        # Generate RSA key pair for JWT signing
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        self.public_key = self.private_key.public_key()
    
    def create_access_token(self, user_id: str, role: str, permissions: list):
        """Create secure access token with limited scope"""
        payload = {
            "sub": user_id,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=30),
            "scope": " ".join(permissions),
            "role": role,
            "type": "access"
        }
        
        return jwt.encode(
            payload, 
            self.private_key, 
            algorithm="RS256"
        )
    
    def verify_token(self, token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token, 
                self.public_key, 
                algorithms=["RS256"]
            )
            
            # Additional security checks
            if self.is_token_blacklisted(payload.get("jti")):
                raise jwt.InvalidTokenError("Token has been revoked")
                
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(401, "Invalid token")
```

### Multi-Factor Authentication (MFA)

#### TOTP Implementation

```python
# backend/app/services/mfa.py

import pyotp
import qrcode
from io import BytesIO

class MFAService:
    def generate_secret(self, user_email: str) -> str:
        """Generate TOTP secret for user"""
        secret = pyotp.random_base32()
        
        # Store encrypted secret in database
        encrypted_secret = self.encrypt_secret(secret)
        self.store_user_secret(user_email, encrypted_secret)
        
        return secret
    
    def generate_qr_code(self, user_email: str, secret: str) -> bytes:
        """Generate QR code for TOTP setup"""
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user_email,
            issuer_name="Bitcorp ERP"
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        
        return buffer.getvalue()
    
    def verify_totp(self, user_email: str, token: str) -> bool:
        """Verify TOTP token"""
        secret = self.get_user_secret(user_email)
        if not secret:
            return False
            
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)  # Allow 30-second window
```

## Authorization Framework

### Role-Based Access Control (RBAC)

#### Role Hierarchy

```python
# backend/app/models/security.py

from enum import Enum
from sqlalchemy import Column, String, JSON, ForeignKey
from sqlalchemy.orm import relationship

class RoleType(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    OPERATOR = "operator"
    VIEWER = "viewer"

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    action = Column(String, nullable=False)
    conditions = Column(JSON)  # Dynamic conditions

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    role_type = Column(Enum(RoleType), nullable=False)
    permissions = relationship("Permission", secondary="role_permissions")

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    roles = relationship("Role", secondary="user_roles")
```

#### Permission Checking

```python
# backend/app/core/permissions.py

from functools import wraps
from typing import List, Optional

class PermissionChecker:
    def __init__(self, user: User):
        self.user = user
        self.permissions = self._load_user_permissions()
    
    def has_permission(
        self, 
        resource: str, 
        action: str, 
        context: Optional[dict] = None
    ) -> bool:
        """Check if user has specific permission"""
        
        for permission in self.permissions:
            if (permission.resource == resource and 
                permission.action == action):
                
                # Check dynamic conditions
                if permission.conditions:
                    return self._evaluate_conditions(
                        permission.conditions, 
                        context
                    )
                return True
        
        return False
    
    def _evaluate_conditions(self, conditions: dict, context: dict) -> bool:
        """Evaluate dynamic permission conditions"""
        # Example: {"owner_only": True, "department": "engineering"}
        
        if conditions.get("owner_only") and context:
            return context.get("owner_id") == self.user.id
            
        if conditions.get("department"):
            return self.user.department == conditions["department"]
            
        return True

def require_permission(resource: str, action: str):
    """Decorator for API endpoint permission checking"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = get_current_user()
            checker = PermissionChecker(current_user)
            
            if not checker.has_permission(resource, action):
                raise HTTPException(403, "Insufficient permissions")
                
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

## Data Protection

### Encryption at Rest

#### Database Encryption

```python
# backend/app/core/encryption.py

from cryptography.fernet import Fernet
from sqlalchemy_utils import EncryptedType
from sqlalchemy_utils.types.encrypted.encrypted_type import AesEngine

class DataEncryption:
    def __init__(self, encryption_key: str):
        self.key = encryption_key.encode()
        self.cipher = Fernet(Fernet.generate_key())
    
    @staticmethod
    def create_encrypted_column(column_type):
        """Create encrypted database column"""
        return EncryptedType(column_type, secret_key, AesEngine, 'pkcs5')

# Usage in models
class EquipmentRecord(Base):
    __tablename__ = "equipment_records"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    
    # Encrypted sensitive fields
    serial_number = Column(DataEncryption.create_encrypted_column(String))
    cost = Column(DataEncryption.create_encrypted_column(Numeric))
    notes = Column(DataEncryption.create_encrypted_column(Text))
```

### Encryption in Transit

#### TLS Configuration

```python
# backend/app/main.py

import ssl
from fastapi import FastAPI
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI()

# Force HTTPS in production
if settings.ENVIRONMENT == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=settings.ALLOWED_HOSTS
    )

# SSL Context for uvicorn
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(
    certfile=settings.SSL_CERT_PATH,
    keyfile=settings.SSL_KEY_PATH
)
```

## Input Validation and Sanitization

### Pydantic Models for Validation

```python
# backend/app/schemas/equipment.py

from pydantic import BaseModel, validator, Field
from typing import Optional
import re

class EquipmentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    serial_number: str = Field(..., regex=r'^[A-Z0-9-]+$')
    cost: float = Field(..., gt=0, le=1000000)
    description: Optional[str] = Field(None, max_length=500)
    
    @validator('name')
    def validate_name(cls, v):
        # Prevent XSS and SQL injection
        if re.search(r'[<>"\';&]', v):
            raise ValueError('Invalid characters in name')
        return v.strip()
    
    @validator('description')
    def validate_description(cls, v):
        if v:
            # Remove potentially dangerous HTML/script tags
            clean_desc = re.sub(r'<[^>]*>', '', v)
            return clean_desc.strip()
        return v

class Config:
    # Prevent additional fields
    extra = "forbid"
    # Validate assignment
    validate_assignment = True
```

### SQL Injection Prevention

```python
# backend/app/services/equipment.py

from sqlalchemy import text
from sqlalchemy.orm import Session

class EquipmentService:
    def __init__(self, db: Session):
        self.db = db
    
    def search_equipment(self, query: str, user_id: str) -> List[Equipment]:
        """Secure equipment search with parameterized queries"""
        
        # Use parameterized queries to prevent SQL injection
        stmt = text("""
            SELECT * FROM equipment 
            WHERE (name ILIKE :query OR description ILIKE :query)
            AND user_id = :user_id
            AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 100
        """)
        
        result = self.db.execute(
            stmt, 
            {
                "query": f"%{query}%", 
                "user_id": user_id
            }
        )
        
        return result.fetchall()
```

## API Security

### Rate Limiting

```python
# backend/app/middleware/rate_limit.py

from fastapi import HTTPException, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

# Rate limiting decorator
@limiter.limit("100/minute")
async def login_endpoint(request: Request, credentials: UserLogin):
    """Login with rate limiting"""
    pass

# Custom rate limit handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    response = JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "detail": f"Try again in {exc.retry_after} seconds"
        }
    )
    response.headers["Retry-After"] = str(exc.retry_after)
    return response
```

### CORS Configuration

```python
# backend/app/core/cors.py

from fastapi.middleware.cors import CORSMiddleware

# Strict CORS policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # Specific domains only
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Total-Count", "X-Request-ID"]
)
```

## Session Management

### Secure Session Handling

```python
# backend/app/services/session.py

import uuid
from datetime import datetime, timedelta
from typing import Optional

class SessionManager:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.session_timeout = timedelta(hours=24)
    
    async def create_session(self, user_id: str, ip_address: str) -> str:
        """Create secure session"""
        session_id = str(uuid.uuid4())
        
        session_data = {
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "ip_address": ip_address,
            "last_activity": datetime.utcnow().isoformat(),
            "csrf_token": str(uuid.uuid4())
        }
        
        # Store in Redis with expiration
        await self.redis.setex(
            f"session:{session_id}",
            int(self.session_timeout.total_seconds()),
            json.dumps(session_data)
        )
        
        return session_id
    
    async def validate_session(self, session_id: str, ip_address: str) -> Optional[dict]:
        """Validate session and check for anomalies"""
        session_data = await self.redis.get(f"session:{session_id}")
        
        if not session_data:
            return None
            
        data = json.loads(session_data)
        
        # Check IP address consistency
        if data["ip_address"] != ip_address:
            await self.invalidate_session(session_id)
            raise SecurityException("Session hijacking detected")
        
        # Update last activity
        data["last_activity"] = datetime.utcnow().isoformat()
        await self.redis.setex(
            f"session:{session_id}",
            int(self.session_timeout.total_seconds()),
            json.dumps(data)
        )
        
        return data
```

## Frontend Security

### Content Security Policy

```typescript
// frontend/src/middleware/security.ts

export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.bitcorp.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

### XSS Prevention

```typescript
// frontend/src/utils/sanitizer.ts

import DOMPurify from 'dompurify'

export class SecurityUtils {
  static sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    })
  }
  
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>"'&]/g, (match) => {
        const escapeMap: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        }
        return escapeMap[match]
      })
  }
  
  static validateCSRFToken(token: string): boolean {
    const storedToken = sessionStorage.getItem('csrf_token')
    return token === storedToken
  }
}
```

## Security Monitoring

### Audit Logging

```python
# backend/app/services/audit.py

from enum import Enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON

class AuditEventType(str, Enum):
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    PERMISSION_DENIED = "permission_denied"
    DATA_ACCESS = "data_access"
    DATA_MODIFICATION = "data_modification"
    SECURITY_VIOLATION = "security_violation"

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True)
    event_type = Column(Enum(AuditEventType), nullable=False)
    user_id = Column(String, nullable=True)
    ip_address = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    resource = Column(String, nullable=True)
    action = Column(String, nullable=True)
    details = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditService:
    @staticmethod
    async def log_event(
        event_type: AuditEventType,
        user_id: Optional[str] = None,
        ip_address: str = "",
        resource: Optional[str] = None,
        action: Optional[str] = None,
        details: Optional[dict] = None
    ):
        """Log security event"""
        audit_log = AuditLog(
            id=str(uuid.uuid4()),
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            resource=resource,
            action=action,
            details=details or {}
        )
        
        db.add(audit_log)
        await db.commit()
        
        # Alert on critical events
        if event_type in [
            AuditEventType.SECURITY_VIOLATION,
            AuditEventType.PERMISSION_DENIED
        ]:
            await SecurityAlerts.send_alert(audit_log)
```

### Intrusion Detection

```python
# backend/app/services/intrusion_detection.py

from collections import defaultdict
from datetime import datetime, timedelta

class IntrusionDetector:
    def __init__(self):
        self.failed_attempts = defaultdict(list)
        self.suspicious_ips = set()
    
    async def check_login_attempt(self, ip_address: str, success: bool):
        """Monitor login attempts for brute force attacks"""
        now = datetime.utcnow()
        
        if not success:
            # Track failed attempts
            self.failed_attempts[ip_address].append(now)
            
            # Clean old attempts (last hour only)
            cutoff = now - timedelta(hours=1)
            self.failed_attempts[ip_address] = [
                attempt for attempt in self.failed_attempts[ip_address] 
                if attempt > cutoff
            ]
            
            # Check for brute force
            if len(self.failed_attempts[ip_address]) >= 5:
                await self.block_ip(ip_address)
                await AuditService.log_event(
                    AuditEventType.SECURITY_VIOLATION,
                    ip_address=ip_address,
                    details={"reason": "brute_force_attack", "attempts": len(self.failed_attempts[ip_address])}
                )
        else:
            # Clear failed attempts on successful login
            if ip_address in self.failed_attempts:
                del self.failed_attempts[ip_address]
    
    async def block_ip(self, ip_address: str):
        """Block suspicious IP address"""
        self.suspicious_ips.add(ip_address)
        
        # Store in Redis for cluster-wide blocking
        await redis.setex(
            f"blocked_ip:{ip_address}",
            3600,  # 1 hour
            "blocked"
        )
```

## Compliance and Governance

### Data Privacy (GDPR Compliance)

```python
# backend/app/services/privacy.py

class PrivacyService:
    @staticmethod
    async def export_user_data(user_id: str) -> dict:
        """Export all user data for GDPR compliance"""
        user_data = {
            "personal_info": await UserService.get_user_profile(user_id),
            "equipment_records": await EquipmentService.get_user_equipment(user_id),
            "audit_logs": await AuditService.get_user_activities(user_id),
            "sessions": await SessionService.get_user_sessions(user_id)
        }
        
        return user_data
    
    @staticmethod
    async def anonymize_user_data(user_id: str):
        """Anonymize user data while preserving business records"""
        # Replace PII with anonymized versions
        anonymized_data = {
            "email": f"deleted_user_{uuid.uuid4()}@anonymized.com",
            "first_name": "[DELETED]",
            "last_name": "[DELETED]",
            "phone": "[DELETED]"
        }
        
        await UserService.update_user(user_id, anonymized_data)
        
        # Log privacy action
        await AuditService.log_event(
            AuditEventType.DATA_MODIFICATION,
            user_id=user_id,
            action="data_anonymization",
            details={"reason": "user_request"}
        )
```

## Security Testing

### Automated Security Tests

```python
# tests/security/test_authentication.py

import pytest
from fastapi.testclient import TestClient

class TestAuthenticationSecurity:
    def test_jwt_token_expiration(self, client: TestClient):
        """Test that expired tokens are rejected"""
        # Create expired token
        expired_token = create_expired_token()
        
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        
        assert response.status_code == 401
        assert "expired" in response.json()["detail"].lower()
    
    def test_sql_injection_prevention(self, client: TestClient, auth_headers):
        """Test SQL injection protection"""
        malicious_input = "'; DROP TABLE users; --"
        
        response = client.get(
            f"/api/v1/equipment/search?q={malicious_input}",
            headers=auth_headers
        )
        
        # Should not cause server error
        assert response.status_code in [200, 400]
        
        # Database should still be intact
        users_count = db.query(User).count()
        assert users_count > 0
    
    def test_rate_limiting(self, client: TestClient):
        """Test rate limiting protection"""
        # Make many rapid requests
        responses = []
        for _ in range(110):  # Exceed 100/minute limit
            response = client.post("/api/v1/auth/login", json={
                "username": "test@example.com",
                "password": "wrongpassword"
            })
            responses.append(response)
        
        # Should get rate limited
        assert any(r.status_code == 429 for r in responses[-10:])
```

This comprehensive security architecture provides multiple layers of protection, following industry best practices and implementing robust security controls throughout the entire system stack.
