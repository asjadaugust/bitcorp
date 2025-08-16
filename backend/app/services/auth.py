from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, Tuple, List
from datetime import datetime
from app.models.user import User, Role, Permission
from app.api.v1.auth.schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class UserService:
    @staticmethod
    def get_user(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_user_by_username_or_email(db: Session, identifier: str) -> Optional[User]:
        """Get user by username or email"""
        return db.query(User).filter(
            or_(User.username == identifier, User.email == identifier)
        ).first()

    @staticmethod
    def create_user(db: Session, user: UserCreate) -> User:
        """Create a new user"""
        hashed_password = get_password_hash(user.password)
        db_user = User(
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            hashed_password=hashed_password,
            is_active=user.is_active
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Update user"""
        db_user = UserService.get_user(db, user_id)
        if not db_user:
            return None
        
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """Authenticate user by username/email and password"""
        user = UserService.get_user_by_username_or_email(db, username)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def update_last_login(db: Session, user_id: int):
        """Update user's last login timestamp"""
        db_user = UserService.get_user(db, user_id)
        if db_user:
            db_user.last_login = datetime.utcnow()
            db.commit()

    @staticmethod
    def assign_role(db: Session, user_id: int, role_name: str) -> bool:
        """Assign role to user"""
        user = UserService.get_user(db, user_id)
        role = RoleService.get_role_by_name(db, role_name)
        
        if not user or not role:
            return False
        
        if role not in user.roles:
            user.roles.append(role)
            db.commit()
        
        return True

    @staticmethod
    def remove_role(db: Session, user_id: int, role_name: str) -> bool:
        """Remove role from user"""
        user = UserService.get_user(db, user_id)
        role = RoleService.get_role_by_name(db, role_name)
        
        if not user or not role:
            return False
        
        if role in user.roles:
            user.roles.remove(role)
            db.commit()
        
        return True

    @staticmethod
    def get_users_paginated(
        db: Session, 
        skip: int = 0, 
        limit: int = 50, 
        search: Optional[str] = None,
        role_filter: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Tuple[List[User], int]:
        """Get paginated list of users with filtering"""
        query = db.query(User)
        
        # Apply filters
        if search:
            query = query.filter(or_(
                User.first_name.ilike(f"%{search}%"),
                User.last_name.ilike(f"%{search}%"),
                User.username.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            ))
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        if role_filter:
            query = query.join(User.roles).filter(Role.name == role_filter)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        users = query.offset(skip).limit(limit).all()
        
        return users, total

    @staticmethod
    def deactivate_user(db: Session, user_id: int) -> bool:
        """Deactivate a user"""
        user = UserService.get_user(db, user_id)
        if not user:
            return False
        
        db.query(User).filter(User.id == user_id).update({"is_active": False})
        db.commit()
        return True

    @staticmethod
    def activate_user(db: Session, user_id: int) -> bool:
        """Activate a user"""
        user = UserService.get_user(db, user_id)
        if not user:
            return False
        
        db.query(User).filter(User.id == user_id).update({"is_active": True})
        db.commit()
        return True


class RoleService:
    @staticmethod
    def get_role(db: Session, role_id: int) -> Optional[Role]:
        """Get role by ID"""
        return db.query(Role).filter(Role.id == role_id).first()

    @staticmethod
    def get_role_by_name(db: Session, role_name: str) -> Optional[Role]:
        """Get role by name"""
        return db.query(Role).filter(Role.name == role_name).first()

    @staticmethod
    def create_role(db: Session, name: str, description: Optional[str] = None) -> Role:
        """Create a new role"""
        db_role = Role(name=name, description=description)
        db.add(db_role)
        db.commit()
        db.refresh(db_role)
        return db_role

    @staticmethod
    def get_all_roles(db: Session):
        """Get all roles"""
        return db.query(Role).filter(Role.is_active.is_(True)).all()


class PermissionService:
    @staticmethod
    def get_permission(db: Session, permission_id: int) -> Optional[Permission]:
        """Get permission by ID"""
        return db.query(Permission).filter(Permission.id == permission_id).first()

    @staticmethod
    def get_permission_by_name(db: Session, permission_name: str) -> Optional[Permission]:
        """Get permission by name"""
        return db.query(Permission).filter(Permission.name == permission_name).first()

    @staticmethod
    def create_permission(db: Session, name: str, resource: str, action: str, description: Optional[str] = None) -> Permission:
        """Create a new permission"""
        db_permission = Permission(
            name=name,
            resource=resource,
            action=action,
            description=description
        )
        db.add(db_permission)
        db.commit()
        db.refresh(db_permission)
        return db_permission

    @staticmethod
    def assign_permission_to_role(db: Session, role_id: int, permission_id: int) -> bool:
        """Assign permission to role"""
        role = RoleService.get_role(db, role_id)
        permission = PermissionService.get_permission(db, permission_id)
        
        if not role or not permission:
            return False
        
        if permission not in role.permissions:
            role.permissions.append(permission)
            db.commit()
        
        return True
