from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    is_active: bool = True


class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    full_name: str
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    roles: List["RoleResponse"] = []
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str  # Can be username or email
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class RefreshToken(BaseModel):
    refresh_token: str


# Role Schemas
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class RoleResponse(RoleBase):
    id: int
    created_at: datetime
    permissions: List["PermissionResponse"] = []
    
    class Config:
        from_attributes = True


# Permission Schemas
class PermissionBase(BaseModel):
    name: str
    description: Optional[str] = None
    resource: str
    action: str


class PermissionCreate(PermissionBase):
    pass


class PermissionResponse(PermissionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Update forward references
UserResponse.model_rebuild()
RoleResponse.model_rebuild()
