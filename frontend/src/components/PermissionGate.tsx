import React from 'react';
import { useAuthStore } from '@/stores/auth';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // For multiple roles/permissions, require all vs any
}

/**
 * PermissionGate component for role-based access control
 * Hides/shows UI elements based on user permissions and roles
 */
export function PermissionGate({
  children,
  permission,
  role,
  roles = [],
  permissions = [],
  fallback = null,
  requireAll = false,
}: PermissionGateProps) {
  const { user, hasRole, hasPermission } = useAuthStore();

  if (!user) {
    return <>{fallback}</>;
  }

  // Check single role
  if (role) {
    if (!hasRole(role)) {
      return <>{fallback}</>;
    }
  }

  // Check multiple roles
  if (roles.length > 0) {
    const roleChecks = roles.map((r) => hasRole(r));
    const hasRequiredRoles = requireAll
      ? roleChecks.every((check) => check)
      : roleChecks.some((check) => check);

    if (!hasRequiredRoles) {
      return <>{fallback}</>;
    }
  }

  // Check single permission
  if (permission) {
    if (!hasPermission(permission)) {
      return <>{fallback}</>;
    }
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const permissionChecks = permissions.map((p) => hasPermission(p));
    const hasRequiredPermissions = requireAll
      ? permissionChecks.every((check) => check)
      : permissionChecks.some((check) => check);

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Convenience hooks for common permission patterns
export function useCanManageUsers() {
  const { hasRole } = useAuthStore();
  return hasRole('admin') || hasRole('supervisor');
}

export function useCanCreateUsers() {
  const { hasRole } = useAuthStore();
  return hasRole('admin');
}

export function useCanManageEquipment() {
  const { hasRole, hasPermission } = useAuthStore();
  return (
    hasRole('admin') ||
    hasRole('planning_engineer') ||
    hasPermission('equipment:manage')
  );
}

export function useCanViewReports() {
  const { hasRole, hasPermission } = useAuthStore();
  return (
    hasRole('admin') ||
    hasRole('supervisor') ||
    hasRole('cost_engineer') ||
    hasRole('planning_engineer') ||
    hasPermission('reports:view')
  );
}

export function useCanManageScheduling() {
  const { hasRole, hasPermission } = useAuthStore();
  return (
    hasRole('admin') ||
    hasRole('planning_engineer') ||
    hasPermission('scheduling:manage')
  );
}

export function useCanAccessIoT() {
  const { hasRole, hasPermission } = useAuthStore();
  return (
    hasRole('admin') ||
    hasRole('planning_engineer') ||
    hasRole('supervisor') ||
    hasPermission('iot:view')
  );
}

export function useCanManageSettings() {
  const { hasRole } = useAuthStore();
  return hasRole('admin');
}

// Role-based component props
export interface RoleBasedProps {
  userRole?: string;
  children: React.ReactNode;
}

// Pre-configured permission gates for common use cases
export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
  <PermissionGate role="admin" fallback={fallback}>
    {children}
  </PermissionGate>
);

export const SupervisorOrAdmin: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
  <PermissionGate roles={['admin', 'supervisor']} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const ManagerLevel: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
  <PermissionGate
    roles={['admin', 'supervisor', 'planning_engineer', 'cost_engineer']}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const OperatorLevel: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
  <PermissionGate role="operator" fallback={fallback}>
    {children}
  </PermissionGate>
);

// Permission definitions based on PRD roles
export const ROLE_PERMISSIONS = {
  admin: {
    description: 'Full system access',
    permissions: [
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'equipment:create',
      'equipment:read',
      'equipment:update',
      'equipment:delete',
      'scheduling:create',
      'scheduling:read',
      'scheduling:update',
      'scheduling:delete',
      'reports:create',
      'reports:read',
      'reports:update',
      'reports:delete',
      'settings:read',
      'settings:update',
      'iot:read',
      'iot:manage',
      'roles:assign',
      'permissions:manage',
    ],
  },
  supervisor: {
    description: 'Site supervision and oversight',
    permissions: [
      'users:read',
      'equipment:read',
      'equipment:update',
      'scheduling:read',
      'scheduling:update',
      'reports:read',
      'reports:create',
      'iot:read',
      'daily_reports:approve',
    ],
  },
  planning_engineer: {
    description: 'Equipment planning and scheduling',
    permissions: [
      'equipment:read',
      'equipment:update',
      'scheduling:create',
      'scheduling:read',
      'scheduling:update',
      'scheduling:delete',
      'reports:read',
      'iot:read',
      'equipment:assign',
      'operators:notify',
    ],
  },
  cost_engineer: {
    description: 'Cost analysis and equipment valuation',
    permissions: [
      'equipment:read',
      'reports:create',
      'reports:read',
      'reports:update',
      'daily_reports:approve',
      'equipment:valuate',
      'costs:analyze',
      'salaries:calculate',
    ],
  },
  hr_personnel: {
    description: 'Human resources management',
    permissions: [
      'users:read',
      'users:update',
      'operators:read',
      'operators:update',
      'salaries:read',
      'salaries:calculate',
      'reports:read',
    ],
  },
  operator: {
    description: 'Equipment operation and daily reporting',
    permissions: [
      'daily_reports:create',
      'daily_reports:read',
      'daily_reports:update',
      'profile:read',
      'profile:update',
      'schedule:read',
      'notifications:read',
    ],
  },
} as const;
