import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { authenticatedFetcher } from '@/lib/swr-fetcher';

// Types
interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  roles: Role[];
}

interface Role {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  permissions: Permission[];
}

interface Permission {
  id: number;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at: string;
}

interface UserListResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

interface UsersParams {
  skip?: number;
  limit?: number;
  search?: string;
  role_filter?: string;
  is_active?: boolean | null;
}

interface UserCreateData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  default_role?: string;
  is_active?: boolean;
}

interface UserUpdateData {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

interface AssignRoleData {
  userId: number;
  roleNames: string[];
}

// Cache keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

// Fetchers
const createUserFetcher = async (
  url: string,
  { arg }: { arg: UserCreateData }
) => {
  return authenticatedFetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  });
};

const updateUserFetcher = async (
  url: string,
  { arg }: { arg: { userId: number; userData: UserUpdateData } }
) => {
  return authenticatedFetcher(`${url}/${arg.userId}`, {
    method: 'PUT',
    body: JSON.stringify(arg.userData),
  });
};

const deleteUserFetcher = async (url: string, { arg }: { arg: number }) => {
  return authenticatedFetcher(`${url}/${arg}`, {
    method: 'DELETE',
  });
};

const assignRoleFetcher = async (
  url: string,
  { arg }: { arg: AssignRoleData }
) => {
  return authenticatedFetcher(`${url}/${arg.userId}/roles`, {
    method: 'POST',
    body: JSON.stringify({ role_names: arg.roleNames }),
  });
};

const removeRoleFetcher = async (
  url: string,
  { arg }: { arg: { userId: number; roleName: string } }
) => {
  return authenticatedFetcher(`${url}/${arg.userId}/roles/${arg.roleName}`, {
    method: 'DELETE',
  });
};

// Hooks
export function useUsers(params: UsersParams) {
  const queryParams = new URLSearchParams();

  if (params.skip !== undefined)
    queryParams.append('skip', params.skip.toString());
  if (params.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.role_filter) queryParams.append('role_filter', params.role_filter);
  if (params.is_active !== null && params.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString());
  }

  const url = `/api/v1/users?${queryParams.toString()}`;

  return useSWR<UserListResponse>(
    userKeys.list(params),
    () => authenticatedFetcher<UserListResponse>(url),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );
}

export function useUser(userId: number) {
  return useSWR<User>(
    userKeys.detail(userId),
    () => authenticatedFetcher<User>(`/api/v1/users/${userId}`),
    {
      revalidateOnFocus: false,
    }
  );
}

export function useCreateUser() {
  return useSWRMutation('/api/v1/users', createUserFetcher);
}

export function useUpdateUser() {
  return useSWRMutation('/api/v1/users', updateUserFetcher);
}

export function useDeleteUser() {
  return useSWRMutation('/api/v1/users', deleteUserFetcher);
}

export function useAssignUserRole() {
  return useSWRMutation('/api/v1/users', assignRoleFetcher);
}

export function useRemoveUserRole() {
  return useSWRMutation('/api/v1/users', removeRoleFetcher);
}

export function useUserRoles(userId: number) {
  return useSWR<Role[]>(
    [`users`, userId, 'roles'],
    () => authenticatedFetcher<Role[]>(`/api/v1/users/${userId}/roles`),
    {
      revalidateOnFocus: false,
    }
  );
}

export function useUserPermissions(userId: number) {
  return useSWR<Permission[]>(
    [`users`, userId, 'permissions'],
    () =>
      authenticatedFetcher<Permission[]>(`/api/v1/users/${userId}/permissions`),
    {
      revalidateOnFocus: false,
    }
  );
}
