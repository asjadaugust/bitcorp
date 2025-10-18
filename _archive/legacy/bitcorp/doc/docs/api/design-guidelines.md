# API Design Guidelines for Bitcorp ERP

*Based on principles from "API Design Patterns" by JJ Geewax and REST API best practices*

## Table of Contents

- [Core Principles](#core-principles)
- [Resource Design](#resource-design)
- [HTTP Methods and Status Codes](#http-methods-and-status-codes)
- [Request/Response Patterns](#requestresponse-patterns)
- [Authentication and Authorization](#authentication-and-authorization)
- [Error Handling](#error-handling)
- [Pagination and Filtering](#pagination-and-filtering)
- [Versioning Strategy](#versioning-strategy)
- [Performance Considerations](#performance-considerations)

## Core Principles

### 1. Resource-Oriented Design

Design APIs around resources (nouns) rather than actions (verbs).

```
✅ Good:
GET /api/v1/equipment
POST /api/v1/equipment
GET /api/v1/equipment/{id}
PUT /api/v1/equipment/{id}
DELETE /api/v1/equipment/{id}

❌ Bad:
POST /api/v1/createEquipment
POST /api/v1/updateEquipment
POST /api/v1/deleteEquipment
```

### 2. Consistency

Maintain consistent patterns across all endpoints.

### 3. Predictability

API behavior should be intuitive and follow established conventions.

### 4. Extensibility

Design for future growth without breaking existing clients.

## Resource Design

### Resource Hierarchy

Structure resources to reflect domain relationships:

```
/companies/{company_id}
/companies/{company_id}/equipment
/companies/{company_id}/equipment/{equipment_id}
/companies/{company_id}/equipment/{equipment_id}/maintenance-records
/companies/{company_id}/users
/equipment/{equipment_id}/assignments
```

### Resource Naming Conventions

```python
# ✅ Good examples:
/equipment                     # Collection of equipment
/equipment/{equipment_id}      # Specific equipment item
/equipment/{id}/maintenance-records  # Sub-collection
/users/{user_id}/permissions   # Related resources

# Resource naming rules:
# - Use plural nouns for collections
# - Use kebab-case for multi-word resources
# - Use meaningful, descriptive names
# - Avoid deeply nested resources (max 3 levels)
```

### Standard Resource Operations

```python
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from .schemas import EquipmentCreate, EquipmentUpdate, EquipmentResponse, EquipmentListResponse
from .services import EquipmentService
from .dependencies import get_current_user, get_equipment_service

router = APIRouter(prefix="/equipment", tags=["equipment"])

# Collection operations
@router.get("", response_model=EquipmentListResponse)
async def list_equipment(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    status: Optional[str] = Query(None, description="Filter by equipment status"),
    company_id: Optional[str] = Query(None, description="Filter by company"),
    search: Optional[str] = Query(None, description="Search in name and serial number"),
    current_user: User = Depends(get_current_user),
    service: EquipmentService = Depends(get_equipment_service)
):
    """
    List equipment with filtering and pagination.
    
    - **skip**: Number of items to skip (for pagination)
    - **limit**: Maximum number of items to return (1-100)
    - **status**: Filter by equipment status (active, maintenance, retired)
    - **company_id**: Filter by company ID
    - **search**: Search in equipment name and serial number
    """
    return await service.list_equipment(
        skip=skip,
        limit=limit,
        status=status,
        company_id=company_id,
        search=search,
        user=current_user
    )

@router.post("", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    equipment_data: EquipmentCreate,
    current_user: User = Depends(get_current_user),
    service: EquipmentService = Depends(get_equipment_service)
):
    """Create new equipment item."""
    return await service.create_equipment(equipment_data, current_user)

# Item operations
@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment(
    equipment_id: str,
    current_user: User = Depends(get_current_user),
    service: EquipmentService = Depends(get_equipment_service)
):
    """Get equipment by ID."""
    equipment = await service.get_equipment(equipment_id, current_user)
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment with ID {equipment_id} not found"
        )
    return equipment

@router.put("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: str,
    equipment_data: EquipmentUpdate,
    current_user: User = Depends(get_current_user),
    service: EquipmentService = Depends(get_equipment_service)
):
    """Update equipment by ID."""
    return await service.update_equipment(equipment_id, equipment_data, current_user)

@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(
    equipment_id: str,
    current_user: User = Depends(get_current_user),
    service: EquipmentService = Depends(get_equipment_service)
):
    """Delete equipment by ID."""
    await service.delete_equipment(equipment_id, current_user)
```

## HTTP Methods and Status Codes

### HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource(s) | ✅ | ✅ |
| POST | Create new resource | ❌ | ❌ |
| PUT | Update/replace entire resource | ✅ | ❌ |
| PATCH | Partial update | ❌ | ❌ |
| DELETE | Remove resource | ✅ | ❌ |

### Standard Status Codes

```python
# Success responses
200 OK              # Successful GET, PUT, PATCH
201 Created         # Successful POST (resource created)
204 No Content      # Successful DELETE, PUT with no response body

# Client error responses
400 Bad Request     # Invalid request syntax or data
401 Unauthorized    # Authentication required
403 Forbidden       # Authentication provided but insufficient permissions
404 Not Found       # Resource doesn't exist
409 Conflict        # Resource conflict (e.g., duplicate)
422 Unprocessable Entity  # Valid syntax but semantic errors

# Server error responses
500 Internal Server Error  # Unexpected server error
503 Service Unavailable   # Temporary server unavailability
```

### Status Code Implementation

```python
from fastapi import HTTPException, status

class APIException(HTTPException):
    """Base API exception with consistent error format."""
    
    def __init__(self, status_code: int, message: str, details: dict = None):
        self.status_code = status_code
        self.detail = {
            "message": message,
            "details": details or {},
            "timestamp": datetime.utcnow().isoformat(),
            "status_code": status_code
        }
        super().__init__(status_code=status_code, detail=self.detail)

class ResourceNotFoundError(APIException):
    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=f"{resource_type} not found",
            details={"resource_id": resource_id}
        )

class ValidationError(APIException):
    def __init__(self, field: str, message: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            message="Validation error",
            details={"field": field, "message": message}
        )
```

## Request/Response Patterns

### Request Schemas

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum

class EquipmentStatus(str, Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    RETIRED = "retired"

class EquipmentCreate(BaseModel):
    """Schema for creating equipment."""
    
    name: str = Field(..., min_length=1, max_length=200, description="Equipment name")
    description: Optional[str] = Field(None, max_length=1000, description="Equipment description")
    serial_number: str = Field(..., regex=r'^EQ-\d{4}-[A-Z]{2}-\d{6}$', description="Unique serial number")
    purchase_date: datetime = Field(..., description="Purchase date")
    purchase_price: Decimal = Field(..., gt=0, description="Purchase price in USD")
    company_id: str = Field(..., description="Company ID")
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Excavator CAT 320",
                "description": "Heavy-duty excavator for construction work",
                "serial_number": "EQ-2023-CT-123456",
                "purchase_date": "2023-01-15T00:00:00Z",
                "purchase_price": "125000.00",
                "company_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }

class EquipmentUpdate(BaseModel):
    """Schema for updating equipment."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[EquipmentStatus] = None
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Updated Excavator CAT 320",
                "status": "maintenance"
            }
        }
```

### Response Schemas

```python
class EquipmentResponse(BaseModel):
    """Schema for equipment response."""
    
    id: str
    name: str
    description: Optional[str]
    serial_number: str
    status: EquipmentStatus
    purchase_date: datetime
    purchase_price: Decimal
    company_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class EquipmentListResponse(BaseModel):
    """Schema for paginated equipment list."""
    
    items: List[EquipmentResponse]
    total: int
    page: int
    size: int
    pages: int
    
    class Config:
        schema_extra = {
            "example": {
                "items": [...],
                "total": 150,
                "page": 1,
                "size": 50,
                "pages": 3
            }
        }
```

### Response Envelope

```python
from typing import Generic, TypeVar, Optional

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    """Standard API response envelope."""
    
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "data": {...},
                "message": "Operation completed successfully",
                "timestamp": "2023-01-15T10:30:00Z"
            }
        }

# Usage in endpoints
@router.get("/{equipment_id}", response_model=APIResponse[EquipmentResponse])
async def get_equipment(equipment_id: str):
    equipment = await service.get_equipment(equipment_id)
    return APIResponse(
        data=equipment,
        message="Equipment retrieved successfully"
    )
```

## Authentication and Authorization

### JWT Implementation

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta

security = HTTPBearer()

class AuthService:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
    
    def create_access_token(self, user_id: str, permissions: List[str]) -> str:
        payload = {
            "sub": user_id,
            "permissions": permissions,
            "exp": datetime.utcnow() + timedelta(hours=1),
            "iat": datetime.utcnow(),
            "type": "access"
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> User:
    """Extract and validate current user from JWT token."""
    
    payload = auth_service.verify_token(credentials.credentials)
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user
```

### Permission-Based Authorization

```python
from functools import wraps
from typing import List, Callable

def require_permissions(*required_permissions: str):
    """Decorator to enforce permission requirements."""
    
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract current_user from kwargs
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            # Check permissions
            user_permissions = set(current_user.permissions)
            required_perms = set(required_permissions)
            
            if not required_perms.issubset(user_permissions):
                missing_perms = required_perms - user_permissions
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing permissions: {', '.join(missing_perms)}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Usage
@router.delete("/{equipment_id}")
@require_permissions("equipment:delete")
async def delete_equipment(
    equipment_id: str,
    current_user: User = Depends(get_current_user)
):
    # Implementation
    pass
```

## Error Handling

### Standardized Error Responses

```python
class ErrorDetail(BaseModel):
    """Standard error detail format."""
    
    code: str
    message: str
    field: Optional[str] = None
    
class ErrorResponse(BaseModel):
    """Standard error response format."""
    
    success: bool = False
    error: ErrorDetail
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "success": False,
                "error": {
                    "code": "RESOURCE_NOT_FOUND",
                    "message": "Equipment with ID 123 not found",
                    "field": "equipment_id"
                },
                "timestamp": "2023-01-15T10:30:00Z",
                "request_id": "req_123456789"
            }
        }

# Global exception handler
from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for unhandled errors."""
    
    request_id = getattr(request.state, 'request_id', None)
    
    if isinstance(exc, APIException):
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(
                error=ErrorDetail(
                    code=exc.error_code,
                    message=exc.message,
                    field=exc.field
                ),
                request_id=request_id
            ).dict()
        )
    
    # Log unexpected errors
    logger.exception(f"Unhandled exception: {exc}")
    
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error=ErrorDetail(
                code="INTERNAL_SERVER_ERROR",
                message="An unexpected error occurred"
            ),
            request_id=request_id
        ).dict()
    )

# Register handler
app = FastAPI()
app.add_exception_handler(Exception, global_exception_handler)
```

## Pagination and Filtering

### Cursor-Based Pagination

```python
from typing import Optional, List
from base64 import b64encode, b64decode
import json

class CursorPagination(BaseModel):
    """Cursor-based pagination parameters."""
    
    after: Optional[str] = Field(None, description="Cursor for next page")
    before: Optional[str] = Field(None, description="Cursor for previous page")
    limit: int = Field(50, ge=1, le=100, description="Number of items to return")

class PageInfo(BaseModel):
    """Pagination metadata."""
    
    has_next_page: bool
    has_previous_page: bool
    start_cursor: Optional[str]
    end_cursor: Optional[str]

class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response with cursor information."""
    
    edges: List[T]
    page_info: PageInfo
    total_count: Optional[int] = None

def encode_cursor(data: dict) -> str:
    """Encode cursor data to base64 string."""
    json_str = json.dumps(data, sort_keys=True)
    return b64encode(json_str.encode()).decode()

def decode_cursor(cursor: str) -> dict:
    """Decode cursor from base64 string."""
    try:
        json_str = b64decode(cursor.encode()).decode()
        return json.loads(json_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid cursor format"
        )

# Implementation in service
class EquipmentService:
    async def list_equipment_paginated(
        self,
        pagination: CursorPagination,
        filters: EquipmentFilters
    ) -> PaginatedResponse[EquipmentResponse]:
        
        query = self.build_query(filters)
        
        # Apply cursor filtering
        if pagination.after:
            cursor_data = decode_cursor(pagination.after)
            query = query.filter(
                Equipment.created_at > cursor_data['created_at'],
                Equipment.id > cursor_data['id']
            )
        
        if pagination.before:
            cursor_data = decode_cursor(pagination.before)
            query = query.filter(
                Equipment.created_at < cursor_data['created_at'],
                Equipment.id < cursor_data['id']
            )
        
        # Fetch one extra item to determine if there are more pages
        items = await query.limit(pagination.limit + 1).all()
        
        has_next_page = len(items) > pagination.limit
        if has_next_page:
            items = items[:-1]  # Remove the extra item
        
        # Generate cursors
        start_cursor = None
        end_cursor = None
        
        if items:
            start_cursor = encode_cursor({
                'created_at': items[0].created_at.isoformat(),
                'id': items[0].id
            })
            end_cursor = encode_cursor({
                'created_at': items[-1].created_at.isoformat(),
                'id': items[-1].id
            })
        
        return PaginatedResponse(
            edges=[EquipmentResponse.from_orm(item) for item in items],
            page_info=PageInfo(
                has_next_page=has_next_page,
                has_previous_page=pagination.after is not None,
                start_cursor=start_cursor,
                end_cursor=end_cursor
            )
        )
```

## Versioning Strategy

### URL Path Versioning

```python
# Version in URL path (recommended for major versions)
v1_router = APIRouter(prefix="/api/v1")
v2_router = APIRouter(prefix="/api/v2")

# Version-specific implementations
@v1_router.get("/equipment/{equipment_id}")
async def get_equipment_v1(equipment_id: str):
    # V1 implementation
    pass

@v2_router.get("/equipment/{equipment_id}")
async def get_equipment_v2(equipment_id: str):
    # V2 implementation with breaking changes
    pass
```

### Header-Based Versioning

```python
from fastapi import Header
from typing import Optional

@router.get("/equipment/{equipment_id}")
async def get_equipment(
    equipment_id: str,
    api_version: Optional[str] = Header(None, alias="API-Version")
):
    """Get equipment with version-specific behavior."""
    
    version = api_version or "1.0"
    
    if version.startswith("2."):
        return await get_equipment_v2(equipment_id)
    else:
        return await get_equipment_v1(equipment_id)
```

## Performance Considerations

### Response Caching

```python
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache

@router.get("/equipment/{equipment_id}")
@cache(expire=300)  # Cache for 5 minutes
async def get_equipment(equipment_id: str):
    """Get equipment with response caching."""
    return await service.get_equipment(equipment_id)

# Conditional caching based on user permissions
@router.get("/equipment")
async def list_equipment(
    current_user: User = Depends(get_current_user)
):
    """List equipment with user-specific caching."""
    
    cache_key = f"equipment_list_{current_user.company_id}_{current_user.role}"
    
    # Check cache first
    cached_result = await cache.get(cache_key)
    if cached_result:
        return cached_result
    
    # Fetch data and cache
    result = await service.list_equipment(current_user)
    await cache.set(cache_key, result, expire=60)
    
    return result
```

### Request/Response Compression

```python
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Database Query Optimization

```python
# Use select loading to avoid N+1 queries
from sqlalchemy.orm import selectinload

async def get_equipment_with_maintenance(equipment_id: str):
    """Get equipment with maintenance records in single query."""
    
    result = await db.session.execute(
        select(Equipment)
        .options(selectinload(Equipment.maintenance_records))
        .where(Equipment.id == equipment_id)
    )
    return result.scalar_one_or_none()

# Use projections for list endpoints
async def list_equipment_summary():
    """Get equipment summary without loading full objects."""
    
    result = await db.session.execute(
        select(
            Equipment.id,
            Equipment.name,
            Equipment.status,
            Equipment.serial_number
        )
        .where(Equipment.status == EquipmentStatus.ACTIVE)
    )
    return result.all()
```

---

*This guide should be regularly updated to reflect API evolution and new patterns.*
