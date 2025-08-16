import useSWR from 'swr';
import { authenticatedFetcher } from '@/lib/swr-fetcher';

// Types
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

// Cache keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: () => [...roleKeys.lists()] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
};

// Hooks
export function useRoles() {
  return useSWR<Role[]>(
    roleKeys.list(),
    () => authenticatedFetcher<Role[]>('/api/v1/auth/roles'),
    {
      revalidateOnFocus: false,
    }
  );
}

export function useRole(roleId: number) {
  return useSWR<Role>(
    roleKeys.detail(roleId),
    () => authenticatedFetcher<Role>(`/api/v1/roles/${roleId}`),
    {
      revalidateOnFocus: false,
    }
  );
}
