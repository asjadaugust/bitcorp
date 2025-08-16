from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.core.deps import get_current_active_user, security
from app.api.v1.auth.schemas import (
    UserCreate, UserResponse, UserLogin, Token, RefreshToken,
    RoleResponse
)
from app.services.auth import UserService, RoleService
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Check if user already exists
    if UserService.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if UserService.get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    user = UserService.create_user(db, user_data)
    
    # Assign default role (operator) to new users
    UserService.assign_role(db, user.id, "operator")
    
    return user


@router.post("/login", response_model=Token)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user and return JWT tokens"""
    user = UserService.authenticate_user(db, login_data.username, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login
    UserService.update_last_login(db, user.id)
    
    # Create tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_data: RefreshToken,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    user_id = verify_token(refresh_data.refresh_token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = UserService.get_user(db, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information"""
    return current_user


@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Logout user (in a real implementation, you'd blacklist the token)"""
    # In a production app, you'd add the token to a blacklist
    # For now, we just return success
    return {"message": "Successfully logged out"}


@router.get("/roles", response_model=list[RoleResponse])
def get_all_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all available roles (admin only)"""
    if not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return RoleService.get_all_roles(db)


@router.post("/users/{user_id}/roles/{role_name}")
def assign_user_role(
    user_id: int,
    role_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Assign role to user (admin only)"""
    if not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    success = UserService.assign_role(db, user_id, role_name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User or role not found"
        )
    
    return {"message": f"Role {role_name} assigned to user {user_id}"}


@router.delete("/users/{user_id}/roles/{role_name}")
def remove_user_role(
    user_id: int,
    role_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove role from user (admin only)"""
    if not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    success = UserService.remove_role(db, user_id, role_name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User or role not found"
        )
    
    return {"message": f"Role {role_name} removed from user {user_id}"}
