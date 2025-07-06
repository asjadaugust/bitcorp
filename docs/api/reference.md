# API Reference Guide

## Overview

This document provides comprehensive documentation for the Bitcorp ERP REST API, following the design principles outlined in "API Design Patterns" by JJ Geewax and industry best practices.

## Base Information

### Base URL
- **Development**: `http://localhost:8000/api/v1`
- **Production**: `https://api.bitcorp.com/api/v1`

### Authentication
All API endpoints require authentication via JWT tokens, except for login and registration endpoints.

```http
Authorization: Bearer <jwt_token>
```

### Content Type
All requests and responses use JSON format:

```http
Content-Type: application/json
```

### API Versioning
The API uses URL path versioning:
- Current version: `/api/v1/`
- Future versions: `/api/v2/`, `/api/v3/`, etc.

## Standard Response Format

### Success Response
```json
{
  "data": { /* Response data */ },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "request_id": "req_123456789"
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "request_id": "req_123456789"
  }
}
```

### Pagination Response
```json
{
  "data": [/* Array of items */],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_items": 150,
    "total_pages": 8,
    "has_next": true,
    "has_previous": false
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "request_id": "req_123456789"
  }
}
```

## Authentication Endpoints

### POST /auth/login

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "secure_password"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_string",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "request_id": "req_123456789"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded
- `422 Unprocessable Entity`: Invalid request data

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "first_name": "Jane",
  "last_name": "Smith",
  "password": "secure_password"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "user": {
      "id": "user_124",
      "email": "newuser@example.com",
      "username": "newuser",
      "first_name": "Jane",
      "last_name": "Smith",
      "role": "viewer",
      "created_at": "2024-01-15T10:30:00Z",
      "is_active": true
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "request_id": "req_123456790"
  }
}
```

### POST /auth/refresh

Refresh JWT access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "refresh_token_string"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "access_token": "new_access_token",
    "refresh_token": "new_refresh_token",
    "token_type": "bearer",
    "expires_in": 1800
  }
}
```

### GET /auth/me

Get current user information.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "username": "user123",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin",
      "permissions": ["equipment.read", "equipment.write", "reports.read"],
      "last_login": "2024-01-15T09:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

### POST /auth/logout

Logout user and invalidate tokens.

**Response (200 OK):**
```json
{
  "data": {
    "message": "Successfully logged out"
  }
}
```

## Equipment Management Endpoints

### GET /equipment

Retrieve equipment list with filtering and pagination.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `per_page` (integer): Items per page (default: 20, max: 100)
- `search` (string): Search term for name or serial number
- `status` (string): Filter by status (`active`, `maintenance`, `retired`)
- `category` (string): Filter by equipment category
- `sort_by` (string): Sort field (`name`, `created_at`, `cost`)
- `sort_order` (string): Sort order (`asc`, `desc`)

**Example Request:**
```http
GET /api/v1/equipment?page=1&per_page=20&status=active&sort_by=name&sort_order=asc
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "eq_123",
      "name": "Excavator CAT 320",
      "serial_number": "CAT320-2024-001",
      "category": "excavator",
      "status": "active",
      "cost": 250000.00,
      "purchase_date": "2024-01-01",
      "manufacturer": "Caterpillar",
      "model": "320 GC",
      "year": 2024,
      "location": "Site A",
      "assigned_operator": {
        "id": "op_456",
        "name": "John Operator",
        "email": "john.op@example.com"
      },
      "last_maintenance": "2024-01-10T08:00:00Z",
      "next_maintenance": "2024-02-10T08:00:00Z",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_items": 45,
    "total_pages": 3,
    "has_next": true,
    "has_previous": false
  }
}
```

### GET /equipment/{equipment_id}

Get detailed information about specific equipment.

**Path Parameters:**
- `equipment_id` (string): Equipment identifier

**Response (200 OK):**
```json
{
  "data": {
    "equipment": {
      "id": "eq_123",
      "name": "Excavator CAT 320",
      "serial_number": "CAT320-2024-001",
      "category": "excavator",
      "status": "active",
      "cost": 250000.00,
      "purchase_date": "2024-01-01",
      "manufacturer": "Caterpillar",
      "model": "320 GC",
      "year": 2024,
      "location": "Site A",
      "specifications": {
        "engine_power": "122 HP",
        "operating_weight": "20,300 kg",
        "bucket_capacity": "0.8 m³"
      },
      "assigned_operator": {
        "id": "op_456",
        "name": "John Operator",
        "email": "john.op@example.com",
        "phone": "+1-555-0123"
      },
      "maintenance_history": [
        {
          "id": "maint_789",
          "type": "preventive",
          "description": "Regular 500-hour service",
          "date": "2024-01-10T08:00:00Z",
          "cost": 1200.00,
          "technician": "Mike Mechanic",
          "next_service_hours": 1000
        }
      ],
      "usage_statistics": {
        "total_hours": 750,
        "hours_this_month": 120,
        "fuel_consumption_avg": "25.5 L/hour",
        "efficiency_rating": 85
      },
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Equipment not found
- `403 Forbidden`: Insufficient permissions

### POST /equipment

Create new equipment record.

**Request Body:**
```json
{
  "name": "Bulldozer CAT D6T",
  "serial_number": "CAT-D6T-2024-002",
  "category": "bulldozer",
  "manufacturer": "Caterpillar",
  "model": "D6T",
  "year": 2024,
  "cost": 350000.00,
  "purchase_date": "2024-01-15",
  "location": "Site B",
  "specifications": {
    "engine_power": "215 HP",
    "operating_weight": "18,400 kg",
    "blade_capacity": "3.5 m³"
  },
  "assigned_operator_id": "op_789"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "equipment": {
      "id": "eq_124",
      "name": "Bulldozer CAT D6T",
      "serial_number": "CAT-D6T-2024-002",
      "category": "bulldozer",
      "status": "active",
      "cost": 350000.00,
      "purchase_date": "2024-01-15",
      "manufacturer": "Caterpillar",
      "model": "D6T",
      "year": 2024,
      "location": "Site B",
      "specifications": {
        "engine_power": "215 HP",
        "operating_weight": "18,400 kg",
        "blade_capacity": "3.5 m³"
      },
      "assigned_operator": {
        "id": "op_789",
        "name": "Sarah Operator",
        "email": "sarah.op@example.com"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

### PUT /equipment/{equipment_id}

Update existing equipment record.

**Path Parameters:**
- `equipment_id` (string): Equipment identifier

**Request Body:**
```json
{
  "name": "Excavator CAT 320 (Updated)",
  "status": "maintenance",
  "location": "Maintenance Yard",
  "assigned_operator_id": "op_999"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "equipment": {
      "id": "eq_123",
      "name": "Excavator CAT 320 (Updated)",
      "status": "maintenance",
      "location": "Maintenance Yard",
      "assigned_operator": {
        "id": "op_999",
        "name": "New Operator",
        "email": "new.op@example.com"
      },
      "updated_at": "2024-01-15T11:00:00Z"
    }
  }
}
```

### DELETE /equipment/{equipment_id}

Delete equipment record (soft delete).

**Path Parameters:**
- `equipment_id` (string): Equipment identifier

**Response (204 No Content)**

## Maintenance Management Endpoints

### GET /equipment/{equipment_id}/maintenance

Get maintenance history for specific equipment.

**Query Parameters:**
- `page` (integer): Page number
- `per_page` (integer): Items per page
- `type` (string): Maintenance type filter
- `date_from` (string): Start date filter (ISO 8601)
- `date_to` (string): End date filter (ISO 8601)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "maint_789",
      "equipment_id": "eq_123",
      "type": "preventive",
      "description": "Regular 500-hour service",
      "date": "2024-01-10T08:00:00Z",
      "duration_hours": 4,
      "cost": 1200.00,
      "technician": {
        "id": "tech_456",
        "name": "Mike Mechanic",
        "certification": "CAT Certified"
      },
      "parts_used": [
        {
          "part_number": "CAT-123456",
          "name": "Oil Filter",
          "quantity": 2,
          "cost": 45.00
        }
      ],
      "next_service_hours": 1000,
      "status": "completed",
      "created_at": "2024-01-10T08:00:00Z",
      "completed_at": "2024-01-10T12:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_items": 12,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

### POST /equipment/{equipment_id}/maintenance

Schedule or record new maintenance.

**Request Body:**
```json
{
  "type": "corrective",
  "description": "Hydraulic system repair",
  "scheduled_date": "2024-01-20T09:00:00Z",
  "estimated_duration_hours": 6,
  "estimated_cost": 2500.00,
  "technician_id": "tech_789",
  "parts_needed": [
    {
      "part_number": "CAT-789012",
      "name": "Hydraulic Pump",
      "quantity": 1,
      "estimated_cost": 1800.00
    }
  ],
  "priority": "high",
  "notes": "Customer reported loss of hydraulic pressure"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "maintenance": {
      "id": "maint_790",
      "equipment_id": "eq_123",
      "type": "corrective",
      "description": "Hydraulic system repair",
      "scheduled_date": "2024-01-20T09:00:00Z",
      "estimated_duration_hours": 6,
      "estimated_cost": 2500.00,
      "technician": {
        "id": "tech_789",
        "name": "Expert Technician",
        "certification": "Hydraulics Specialist"
      },
      "parts_needed": [
        {
          "part_number": "CAT-789012",
          "name": "Hydraulic Pump",
          "quantity": 1,
          "estimated_cost": 1800.00
        }
      ],
      "priority": "high",
      "status": "scheduled",
      "notes": "Customer reported loss of hydraulic pressure",
      "created_at": "2024-01-15T11:30:00Z"
    }
  }
}
```

## Reporting Endpoints

### GET /reports/equipment-utilization

Get equipment utilization report.

**Query Parameters:**
- `date_from` (string): Start date (ISO 8601)
- `date_to` (string): End date (ISO 8601)
- `equipment_ids` (array): Specific equipment IDs
- `group_by` (string): Grouping option (`day`, `week`, `month`)

**Response (200 OK):**
```json
{
  "data": {
    "report": {
      "title": "Equipment Utilization Report",
      "period": {
        "from": "2024-01-01T00:00:00Z",
        "to": "2024-01-15T23:59:59Z"
      },
      "summary": {
        "total_equipment": 45,
        "average_utilization": 78.5,
        "total_hours": 15750,
        "total_cost": 125000.00
      },
      "equipment_data": [
        {
          "equipment_id": "eq_123",
          "name": "Excavator CAT 320",
          "utilization_percentage": 85.2,
          "hours_operated": 120,
          "hours_available": 140.8,
          "downtime_hours": 20.8,
          "efficiency_rating": 92.1,
          "daily_breakdown": [
            {
              "date": "2024-01-01",
              "hours_operated": 8.5,
              "fuel_consumed": 68.5,
              "operator": "John Operator"
            }
          ]
        }
      ]
    }
  }
}
```

### GET /reports/maintenance-costs

Get maintenance cost analysis report.

**Query Parameters:**
- `date_from` (string): Start date
- `date_to` (string): End date
- `equipment_category` (string): Filter by category
- `maintenance_type` (string): Filter by maintenance type

**Response (200 OK):**
```json
{
  "data": {
    "report": {
      "title": "Maintenance Cost Analysis",
      "period": {
        "from": "2024-01-01T00:00:00Z",
        "to": "2024-01-15T23:59:59Z"
      },
      "summary": {
        "total_maintenance_cost": 45000.00,
        "preventive_cost": 30000.00,
        "corrective_cost": 15000.00,
        "average_cost_per_equipment": 1000.00,
        "cost_trend": "increasing"
      },
      "cost_breakdown": {
        "by_type": [
          {
            "type": "preventive",
            "cost": 30000.00,
            "percentage": 66.7,
            "count": 25
          },
          {
            "type": "corrective",
            "cost": 15000.00,
            "percentage": 33.3,
            "count": 8
          }
        ],
        "by_category": [
          {
            "category": "excavator",
            "cost": 20000.00,
            "percentage": 44.4,
            "equipment_count": 12
          }
        ]
      }
    }
  }
}
```

## File Upload Endpoints

### POST /equipment/{equipment_id}/documents

Upload documents for equipment.

**Request:** Multipart form data
```
Content-Type: multipart/form-data

file: <binary_file_data>
document_type: "manual" | "warranty" | "inspection" | "photo"
description: "Optional description"
```

**Response (201 Created):**
```json
{
  "data": {
    "document": {
      "id": "doc_123",
      "equipment_id": "eq_123",
      "filename": "manual_cat320.pdf",
      "document_type": "manual",
      "description": "Equipment operation manual",
      "file_size": 2048576,
      "mime_type": "application/pdf",
      "url": "/api/v1/documents/doc_123/download",
      "uploaded_by": {
        "id": "user_123",
        "name": "John Doe"
      },
      "uploaded_at": "2024-01-15T12:00:00Z"
    }
  }
}
```

### GET /documents/{document_id}/download

Download document file.

**Response:** Binary file content with appropriate headers

## WebSocket Endpoints

### /ws/equipment-status

Real-time equipment status updates.

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/equipment-status?token=jwt_token')

ws.onmessage = function(event) {
  const data = JSON.parse(event.data)
  console.log('Equipment status update:', data)
}
```

**Message Format:**
```json
{
  "type": "equipment_status_update",
  "data": {
    "equipment_id": "eq_123",
    "status": "maintenance",
    "location": "Maintenance Yard",
    "operator_id": "op_456",
    "timestamp": "2024-01-15T12:30:00Z"
  }
}
```

## Error Codes

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no content returned |
| 400 | Bad Request | Invalid request syntax |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Application Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_FAILED` | Invalid credentials |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `EXTERNAL_SERVICE_ERROR` | External service unavailable |
| `DATABASE_ERROR` | Database operation failed |

## Rate Limiting

### Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| General API | 100 requests | 1 minute |
| File Upload | 10 requests | 1 minute |
| Reports | 20 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios'

class BitcorpAPI {
  private baseURL = 'https://api.bitcorp.com/api/v1'
  private token?: string

  async login(username: string, password: string) {
    const response = await axios.post(`${this.baseURL}/auth/login`, {
      username,
      password
    })
    
    this.token = response.data.data.access_token
    return response.data.data
  }

  async getEquipment(params?: {
    page?: number
    per_page?: number
    search?: string
    status?: string
  }) {
    const response = await axios.get(`${this.baseURL}/equipment`, {
      headers: { Authorization: `Bearer ${this.token}` },
      params
    })
    
    return response.data.data
  }

  async createEquipment(equipment: CreateEquipmentRequest) {
    const response = await axios.post(
      `${this.baseURL}/equipment`,
      equipment,
      {
        headers: { Authorization: `Bearer ${this.token}` }
      }
    )
    
    return response.data.data.equipment
  }
}
```

### Python

```python
import requests
from typing import Optional, Dict, Any

class BitcorpAPI:
    def __init__(self, base_url: str = "https://api.bitcorp.com/api/v1"):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.session = requests.Session()

    def login(self, username: str, password: str) -> Dict[str, Any]:
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={"username": username, "password": password}
        )
        response.raise_for_status()
        
        data = response.json()["data"]
        self.token = data["access_token"]
        self.session.headers.update({
            "Authorization": f"Bearer {self.token}"
        })
        
        return data

    def get_equipment(
        self,
        page: int = 1,
        per_page: int = 20,
        search: Optional[str] = None,
        status: Optional[str] = None
    ) -> Dict[str, Any]:
        params = {"page": page, "per_page": per_page}
        if search:
            params["search"] = search
        if status:
            params["status"] = status
            
        response = self.session.get(
            f"{self.base_url}/equipment",
            params=params
        )
        response.raise_for_status()
        
        return response.json()["data"]
```

This comprehensive API reference provides detailed documentation for all endpoints, following REST API best practices and ensuring consistent, predictable behavior for client applications.
