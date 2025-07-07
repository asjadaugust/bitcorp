import React from 'react'
import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'
import { swrFetcher, mutationFetcher } from '@/lib/swr-fetcher'
import type {
  Equipment,
  EquipmentCreateRequest,
  EquipmentUpdateRequest,
  EquipmentListResponse,
  EquipmentSearchParams,
  EquipmentUtilization
} from '@/types/equipment'
import { EquipmentStatus } from '@/types/equipment'

// SWR Key factories for consistent cache management
export const equipmentKeys = {
  all: ['equipment'] as const,
  lists: () => [...equipmentKeys.all, 'list'] as const,
  list: (params: EquipmentSearchParams) => [...equipmentKeys.lists(), params] as const,
  details: () => [...equipmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...equipmentKeys.details(), id] as const,
  types: () => [...equipmentKeys.all, 'types'] as const,
  statuses: () => [...equipmentKeys.all, 'statuses'] as const,
  fuelTypes: () => [...equipmentKeys.all, 'fuel-types'] as const,
  utilization: (id: number) => [...equipmentKeys.all, 'utilization', id] as const,
  stats: () => [...equipmentKeys.all, 'stats'] as const,
}

// Helper function to build query string from search params
const buildQueryString = (params: EquipmentSearchParams): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })
  
  return searchParams.toString()
}

// Hook for fetching equipment list with filtering and pagination
export const useEquipmentList = (params: EquipmentSearchParams = {}) => {
  const queryString = buildQueryString(params)
  const key = `/equipment${queryString ? `?${queryString}` : ''}`
  
  const { data, error, isLoading, isValidating, mutate: refetch } = useSWR<EquipmentListResponse>(
    key,
    (url: string) => swrFetcher<EquipmentListResponse>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000, // 5 seconds
    }
  )

  return {
    data,
    equipment: data?.equipment ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    per_page: data?.per_page ?? 20,
    total_pages: data?.total_pages ?? 0,
    error,
    isLoading,
    isValidating,
    refetch,
  }
}

// Hook for fetching a single equipment by ID
export const useEquipment = (id: number | null) => {
  const { data, error, isLoading, isValidating, mutate: refetch } = useSWR(
    id ? `/equipment/${id}` : null,
    (url: string) => swrFetcher<Equipment>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
    }
  )

  return {
    data,
    equipment: data,
    error,
    isLoading,
    isValidating,
    refetch,
  }
}

// Hook for fetching equipment types
export const useEquipmentTypes = () => {
  const { data, error, isLoading } = useSWR(
    '/equipment/types/',
    (url: string) => swrFetcher<string[]>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    data: data ?? [],
    error,
    isLoading,
  }
}

// Hook for fetching equipment statuses
export const useEquipmentStatuses = () => {
  const { data, error, isLoading } = useSWR(
    '/equipment/statuses/',
    (url: string) => swrFetcher<string[]>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    data: data ?? [],
    error,
    isLoading,
  }
}

// Hook for fetching fuel types
export const useFuelTypes = () => {
  const { data, error, isLoading } = useSWR(
    '/equipment/fuel-types/',
    (url: string) => swrFetcher<string[]>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    data: data ?? [],
    error,
    isLoading,
  }
}

// Hook for fetching equipment utilization
export const useEquipmentUtilization = (id: number | null) => {
  const { data, error, isLoading, isValidating, mutate: refetch } = useSWR(
    id ? `/equipment/${id}/utilization` : null,
    (url: string) => swrFetcher<EquipmentUtilization>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    refetch,
  }
}

// Mutation hooks for equipment operations

// Create equipment mutation
export const useCreateEquipment = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    '/equipment',
    async (url: string, { arg }: { arg: EquipmentCreateRequest }) =>
      mutationFetcher<Equipment>(url, { method: 'POST', data: arg }),
    {
      onSuccess: () => {
        // Invalidate all equipment lists
        mutate(key => typeof key === 'string' && key.startsWith('/equipment'))
      },
    }
  )

  return {
    createEquipment: trigger,
    isCreating: isMutating,
    error,
  }
}

// Update equipment mutation
export const useUpdateEquipment = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    '/equipment/update',
    async (url: string, { arg }: { arg: { id: number; data: EquipmentUpdateRequest } }) =>
      mutationFetcher<Equipment>(`/equipment/${arg.id}`, { method: 'PUT', data: arg.data }),
    {
      onSuccess: () => {
        // Invalidate all equipment caches
        mutate(key => typeof key === 'string' && key.startsWith('/equipment'))
      },
    }
  )

  return {
    updateEquipment: trigger,
    isUpdating: isMutating,
    error,
  }
}

// Delete equipment mutation
export const useDeleteEquipment = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    '/equipment/delete',
    async (url: string, { arg }: { arg: number }) =>
      mutationFetcher(`/equipment/${arg}`, { method: 'DELETE' }),
    {
      onSuccess: () => {
        // Invalidate all equipment caches
        mutate(key => typeof key === 'string' && key.startsWith('/equipment'))
      },
    }
  )

  return {
    deleteEquipment: trigger,
    isDeleting: isMutating,
    error,
  }
}

// Update equipment status mutation
export const useUpdateEquipmentStatus = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    '/equipment/status',
    async (url: string, { arg }: { arg: { id: number; status: EquipmentStatus } }) =>
      mutationFetcher(`/equipment/${arg.id}/status`, { 
        method: 'PATCH', 
        data: { new_status: arg.status } 
      }),
    {
      onSuccess: () => {
        // Invalidate all equipment caches
        mutate(key => typeof key === 'string' && key.startsWith('/equipment'))
      },
    }
  )

  return {
    updateStatus: trigger,
    isUpdatingStatus: isMutating,
    error,
  }
}

// Hook for searching equipment (with debouncing support)
export const useEquipmentSearch = (query: string, limit = 10) => {
  const params = query.trim() ? { search: query, per_page: limit } : null
  
  const { data, error, isLoading } = useSWR(
    params ? `/equipment?${buildQueryString(params)}` : null,
    (url: string) => swrFetcher<EquipmentListResponse>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000, // 2 seconds
    }
  )

  return {
    data: data?.equipment ?? [],
    error,
    isLoading,
  }
}

// Hook for getting equipment by status
export const useEquipmentByStatus = (status: EquipmentStatus | null) => {
  const params = status ? { status, per_page: 1000 } : null
  
  const { data, error, isLoading } = useSWR(
    params ? `/equipment?${buildQueryString(params)}` : null,
    (url: string) => swrFetcher<EquipmentListResponse>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
    }
  )

  return {
    data: data?.equipment ?? [],
    error,
    isLoading,
  }
}

// Hook for getting available equipment
export const useAvailableEquipment = () => {
  return useEquipmentByStatus(EquipmentStatus.AVAILABLE)
}

// Hook for equipment statistics (computed from list data)
export const useEquipmentStats = () => {
  const { data, error, isLoading } = useSWR(
    '/equipment?per_page=1000',
    (url: string) => swrFetcher<EquipmentListResponse>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  const stats = React.useMemo(() => {
    if (!data?.equipment) {
      return {
        total: 0,
        by_status: {} as Record<EquipmentStatus, number>,
        by_type: {} as Record<string, number>,
        total_value: 0,
        avg_utilization: 0,
      }
    }

    const result = {
      total: data.total,
      by_status: {} as Record<EquipmentStatus, number>,
      by_type: {} as Record<string, number>,
      total_value: 0,
      avg_utilization: 0,
    }

    // Initialize status counts
    Object.values(EquipmentStatus).forEach(status => {
      result.by_status[status] = 0
    })

    // Calculate statistics
    data.equipment.forEach(equipment => {
      result.by_status[equipment.status]++
      
      if (result.by_type[equipment.equipment_type]) {
        result.by_type[equipment.equipment_type]++
      } else {
        result.by_type[equipment.equipment_type] = 1
      }
      
      if (equipment.current_value) {
        result.total_value += equipment.current_value
      }
    })

    return result
  }, [data])

  return {
    data: stats,
    error,
    isLoading,
  }
}
