"""Database initialization and seeding script"""
from sqlalchemy.orm import Session
from app.core.database import engine, get_db
from app.models.base import Base
from app.models.user import User, Role, Permission
from app.models.company import Company
from app.models.equipment import Equipment
from app.services.auth import UserService, RoleService, PermissionService
from app.api.v1.auth.schemas import UserCreate
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_tables():
    """Create all tables"""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully")


def create_default_permissions(db: Session):
    """Create default permissions"""
    permissions = [
        # User permissions
        ("user_create", "user", "create", "Create new users"),
        ("user_read", "user", "read", "View user information"),
        ("user_update", "user", "update", "Update user information"),
        ("user_delete", "user", "delete", "Delete users"),
        
        # Role permissions
        ("role_manage", "role", "manage", "Manage user roles"),
        
        # Company permissions
        ("company_create", "company", "create", "Create companies"),
        ("company_read", "company", "read", "View company information"),
        ("company_update", "company", "update", "Update company information"),
        ("company_delete", "company", "delete", "Delete companies"),
        
        # Equipment permissions
        ("equipment_create", "equipment", "create", "Create equipment records"),
        ("equipment_read", "equipment", "read", "View equipment information"),
        ("equipment_update", "equipment", "update", "Update equipment information"),
        ("equipment_delete", "equipment", "delete", "Delete equipment records"),
        
        # Report permissions
        ("report_view", "report", "read", "View reports"),
        ("report_create", "report", "create", "Create reports"),
        ("report_export", "report", "export", "Export reports"),
        
        # System permissions
        ("system_admin", "system", "admin", "System administration"),
    ]
    
    logger.info("Creating default permissions...")
    for name, resource, action, description in permissions:
        existing = PermissionService.get_permission_by_name(db, name)
        if not existing:
            PermissionService.create_permission(db, name, resource, action, description)
            logger.info(f"Created permission: {name}")


def create_default_roles(db: Session):
    """Create default roles with permissions"""
    roles = [
        ("admin", "System Administrator", [
            "user_create", "user_read", "user_update", "user_delete",
            "role_manage", "company_create", "company_read", "company_update", "company_delete",
            "equipment_create", "equipment_read", "equipment_update", "equipment_delete",
            "report_view", "report_create", "report_export", "system_admin"
        ]),
        ("developer", "System Developer", [
            "user_read", "company_read", "equipment_create", "equipment_read", 
            "equipment_update", "report_view", "report_create", "report_export", "system_admin"
        ]),
        ("manager", "Project Manager", [
            "company_read", "equipment_read", "equipment_update",
            "report_view", "report_create", "report_export"
        ]),
        ("operator", "Equipment Operator", [
            "equipment_read", "equipment_update", "report_view"
        ])
    ]
    
    logger.info("Creating default roles...")
    for role_name, description, permission_names in roles:
        existing_role = RoleService.get_role_by_name(db, role_name)
        if not existing_role:
            role = RoleService.create_role(db, role_name, description)
            logger.info(f"Created role: {role_name}")
            
            # Assign permissions to role
            for permission_name in permission_names:
                permission = PermissionService.get_permission_by_name(db, permission_name)
                if permission:
                    PermissionService.assign_permission_to_role(db, role.id, permission.id)


def create_admin_user(db: Session):
    """Create default admin user"""
    admin_email = "admin@bitcorp.com"
    existing_admin = UserService.get_user_by_email(db, admin_email)
    
    if not existing_admin:
        logger.info("Creating default admin user...")
        admin_data = UserCreate(
            email=admin_email,
            username="admin",
            first_name="System",
            last_name="Administrator",
            password="admin123!",  # Change this in production!
            is_active=True
        )
        
        admin_user = UserService.create_user(db, admin_data)
        
        # Assign admin and developer roles
        UserService.assign_role(db, admin_user.id, "admin")
        UserService.assign_role(db, admin_user.id, "developer")
        
        logger.info(f"Created admin user with email: {admin_email}")
        logger.warning("Please change the default admin password!")
    else:
        logger.info("Admin user already exists")


def create_developer_user(db: Session):
    """Create default developer user"""
    dev_email = "developer@bitcorp.com"
    existing_dev = UserService.get_user_by_email(db, dev_email)
    
    if not existing_dev:
        logger.info("Creating default developer user...")
        dev_data = UserCreate(
            email=dev_email,
            username="developer",
            first_name="System",
            last_name="Developer",
            password="developer123!",  # Change this in production!
            is_active=True
        )
        
        dev_user = UserService.create_user(db, dev_data)
        
        # Assign developer role
        UserService.assign_role(db, dev_user.id, "developer")
        
        logger.info(f"Created developer user with email: {dev_email}")
        logger.warning("Please change the default developer password!")
    else:
        logger.info("Developer user already exists")


def initialize_database():
    """Initialize database with tables and seed data"""
    logger.info("Initializing database...")
    
    # Create tables
    create_tables()
    
    # Get database session
    db = next(get_db())
    
    try:
        # Create default data
        create_default_permissions(db)
        create_default_roles(db)
        create_admin_user(db)
        create_developer_user(db)
        
        logger.info("Database initialization completed successfully!")
        logger.info("Default users created:")
        logger.info("  Admin: admin@bitcorp.com / admin123!")
        logger.info("  Developer: developer@bitcorp.com / dev123!")
        logger.warning("REMEMBER TO CHANGE DEFAULT PASSWORDS IN PRODUCTION!")
        
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    initialize_database()
