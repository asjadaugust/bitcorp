from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str


class UserCreate(UserBase):
    password: str
    default_role: Optional[str] = "operator"
    is_active: bool = True


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None


class PermissionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    resource: str
    action: str
    created_at: datetime

    class Config:
        from_attributes = True


class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    permissions: List[PermissionResponse] = []

    class Config:
        from_attributes = True


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    full_name: str
    roles: List[RoleResponse] = []

    class Config:
        from_attributes = True


class UserList(BaseModel):
    users: List[UserResponse]
    total: int
    skip: int
    limit: int


class UserRoleAssignment(BaseModel):
    role_names: List[str]


class UserPermissionCheck(BaseModel):
    permission_name: str
    has_permission: bool


class UserRoleCheck(BaseModel):
    role_name: str
    has_role: bool
