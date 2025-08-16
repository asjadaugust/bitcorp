"""
Database initialization script for roles and permissions
Based on Bitcorp ERP Product Requirements Document
"""

from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import Role, Permission
from app.services.auth import RoleService, PermissionService


def create_permissions(db: Session):
    """Create all system permissions"""
    permissions_data = [
        # User Management
        {"name": "users:create", "resource": "users", "action": "create", "description": "Create new users"},
        {"name": "users:read", "resource": "users", "action": "read", "description": "View users"},
        {"name": "users:update", "resource": "users", "action": "update", "description": "Update user information"},
        {"name": "users:delete", "resource": "users", "action": "delete", "description": "Delete/deactivate users"},
        
        # Equipment Management
        {"name": "equipment:create", "resource": "equipment", "action": "create", "description": "Add new equipment"},
        {"name": "equipment:read", "resource": "equipment", "action": "read", "description": "View equipment"},
        {"name": "equipment:update", "resource": "equipment", "action": "update", "description": "Update equipment information"},
        {"name": "equipment:delete", "resource": "equipment", "action": "delete", "description": "Remove equipment"},
        {"name": "equipment:assign", "resource": "equipment", "action": "assign", "description": "Assign equipment to projects"},
        {"name": "equipment:valuate", "resource": "equipment", "action": "valuate", "description": "Generate equipment valuations"},
        
        # Scheduling
        {"name": "scheduling:create", "resource": "scheduling", "action": "create", "description": "Create schedules"},
        {"name": "scheduling:read", "resource": "scheduling", "action": "read", "description": "View schedules"},
        {"name": "scheduling:update", "resource": "scheduling", "action": "update", "description": "Update schedules"},
        {"name": "scheduling:delete", "resource": "scheduling", "action": "delete", "description": "Delete schedules"},
        {"name": "scheduling:manage", "resource": "scheduling", "action": "manage", "description": "Full scheduling management"},
        
        # Reports
        {"name": "reports:create", "resource": "reports", "action": "create", "description": "Create reports"},
        {"name": "reports:read", "resource": "reports", "action": "read", "description": "View reports"},
        {"name": "reports:update", "resource": "reports", "action": "update", "description": "Update reports"},
        {"name": "reports:delete", "resource": "reports", "action": "delete", "description": "Delete reports"},
        {"name": "reports:view", "resource": "reports", "action": "view", "description": "View reports and analytics"},
        
        # Daily Reports
        {"name": "daily_reports:create", "resource": "daily_reports", "action": "create", "description": "Create daily reports"},
        {"name": "daily_reports:read", "resource": "daily_reports", "action": "read", "description": "View daily reports"},
        {"name": "daily_reports:update", "resource": "daily_reports", "action": "update", "description": "Update daily reports"},
        {"name": "daily_reports:approve", "resource": "daily_reports", "action": "approve", "description": "Approve daily reports"},
        
        # IoT Monitoring
        {"name": "iot:read", "resource": "iot", "action": "read", "description": "View IoT data"},
        {"name": "iot:manage", "resource": "iot", "action": "manage", "description": "Manage IoT devices and settings"},
        {"name": "iot:view", "resource": "iot", "action": "view", "description": "Access IoT monitoring dashboard"},
        
        # System Settings
        {"name": "settings:read", "resource": "settings", "action": "read", "description": "View system settings"},
        {"name": "settings:update", "resource": "settings", "action": "update", "description": "Modify system settings"},
        
        # Role and Permission Management
        {"name": "roles:assign", "resource": "roles", "action": "assign", "description": "Assign roles to users"},
        {"name": "permissions:manage", "resource": "permissions", "action": "manage", "description": "Manage permissions"},
        
        # Profile Management
        {"name": "profile:read", "resource": "profile", "action": "read", "description": "View own profile"},
        {"name": "profile:update", "resource": "profile", "action": "update", "description": "Update own profile"},
        
        # Operator Management
        {"name": "operators:read", "resource": "operators", "action": "read", "description": "View operator profiles"},
        {"name": "operators:update", "resource": "operators", "action": "update", "description": "Update operator information"},
        {"name": "operators:notify", "resource": "operators", "action": "notify", "description": "Send notifications to operators"},
        
        # Salary and Cost Management
        {"name": "salaries:read", "resource": "salaries", "action": "read", "description": "View salary information"},
        {"name": "salaries:calculate", "resource": "salaries", "action": "calculate", "description": "Calculate salaries"},
        {"name": "costs:analyze", "resource": "costs", "action": "analyze", "description": "Analyze costs and expenses"},
        
        # Notifications
        {"name": "notifications:read", "resource": "notifications", "action": "read", "description": "View notifications"},
        {"name": "notifications:send", "resource": "notifications", "action": "send", "description": "Send notifications"},
    ]
    
    created_permissions = []
    for perm_data in permissions_data:
        # Check if permission already exists
        existing = db.query(Permission).filter(Permission.name == perm_data["name"]).first()
        if not existing:
            permission = PermissionService.create_permission(
                db=db,
                name=perm_data["name"],
                resource=perm_data["resource"],
                action=perm_data["action"],
                description=perm_data["description"]
            )
            created_permissions.append(permission)
            print(f"Created permission: {permission.name}")
        else:
            created_permissions.append(existing)
            print(f"Permission already exists: {existing.name}")
    
    return created_permissions


def create_roles(db: Session, permissions: list[Permission]):
    """Create all system roles based on PRD requirements"""
    
    # Create permission lookup
    perm_lookup = {p.name: p for p in permissions}
    
    roles_data = [
        {
            "name": "admin",
            "description": "System Administrator - Full access to all system features",
            "permissions": [
                "users:create", "users:read", "users:update", "users:delete",
                "equipment:create", "equipment:read", "equipment:update", "equipment:delete", "equipment:assign", "equipment:valuate",
                "scheduling:create", "scheduling:read", "scheduling:update", "scheduling:delete", "scheduling:manage",
                "reports:create", "reports:read", "reports:update", "reports:delete", "reports:view",
                "daily_reports:create", "daily_reports:read", "daily_reports:update", "daily_reports:approve",
                "iot:read", "iot:manage", "iot:view",
                "settings:read", "settings:update",
                "roles:assign", "permissions:manage",
                "profile:read", "profile:update",
                "operators:read", "operators:update", "operators:notify",
                "salaries:read", "salaries:calculate", "costs:analyze",
                "notifications:read", "notifications:send"
            ]
        },
        {
            "name": "supervisor",
            "description": "Site Supervisor - Oversight of field operations and daily report approval",
            "permissions": [
                "users:read",
                "equipment:read", "equipment:update", "equipment:assign",
                "scheduling:read", "scheduling:update",
                "reports:read", "reports:create", "reports:view",
                "daily_reports:read", "daily_reports:approve",
                "iot:read", "iot:view",
                "profile:read", "profile:update",
                "operators:read", "operators:notify",
                "notifications:read"
            ]
        },
        {
            "name": "planning_engineer",
            "description": "Planning Engineer - Equipment planning, scheduling, and resource optimization",
            "permissions": [
                "equipment:read", "equipment:update", "equipment:assign",
                "scheduling:create", "scheduling:read", "scheduling:update", "scheduling:delete", "scheduling:manage",
                "reports:read", "reports:view",
                "daily_reports:read",
                "iot:read", "iot:view",
                "profile:read", "profile:update",
                "operators:read", "operators:notify",
                "notifications:read"
            ]
        },
        {
            "name": "cost_engineer",
            "description": "Cost and Budget Engineer - Cost analysis and equipment valuation",
            "permissions": [
                "equipment:read", "equipment:valuate",
                "reports:create", "reports:read", "reports:update", "reports:view",
                "daily_reports:read", "daily_reports:approve",
                "profile:read", "profile:update",
                "salaries:read", "salaries:calculate", "costs:analyze",
                "notifications:read"
            ]
        },
        {
            "name": "hr_personnel",
            "description": "HR Personnel - Human resources and operator management",
            "permissions": [
                "users:read", "users:update",
                "reports:read", "reports:view",
                "profile:read", "profile:update",
                "operators:read", "operators:update",
                "salaries:read", "salaries:calculate",
                "notifications:read"
            ]
        },
        {
            "name": "operator",
            "description": "Equipment Operator - Field operations and daily reporting",
            "permissions": [
                "daily_reports:create", "daily_reports:read", "daily_reports:update",
                "profile:read", "profile:update",
                "notifications:read"
            ]
        }
    ]
    
    created_roles = []
    for role_data in roles_data:
        # Check if role already exists
        existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()
        if not existing_role:
            role = RoleService.create_role(
                db=db,
                name=role_data["name"],
                description=role_data["description"]
            )
            created_roles.append(role)
            print(f"Created role: {role.name}")
        else:
            role = existing_role
            created_roles.append(role)
            print(f"Role already exists: {role.name}")
        
        # Assign permissions to role
        for perm_name in role_data["permissions"]:
            if perm_name in perm_lookup:
                permission = perm_lookup[perm_name]
                if permission not in role.permissions:
                    PermissionService.assign_permission_to_role(db, role.id, permission.id)
                    print(f"  Assigned permission {perm_name} to role {role.name}")
    
    return created_roles


def initialize_roles_and_permissions():
    """Initialize all roles and permissions"""
    print("Initializing roles and permissions...")
    
    # Get database session
    db = next(get_db())
    
    try:
        # Create all permissions
        print("\n1. Creating permissions...")
        permissions = create_permissions(db)
        
        # Create all roles and assign permissions
        print("\n2. Creating roles and assigning permissions...")
        roles = create_roles(db, permissions)
        
        print(f"\nInitialization complete!")
        print(f"Created/verified {len(permissions)} permissions")
        print(f"Created/verified {len(roles)} roles")
        
        # Print role summary
        print("\nRole Summary:")
        for role in roles:
            print(f"  {role.name}: {len(role.permissions)} permissions")
        
    except Exception as e:
        print(f"Error during initialization: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    initialize_roles_and_permissions()
