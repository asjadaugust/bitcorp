import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { fetcher } from '../lib/swr-fetcher'
import type {
  EquipmentSchedule,
  EquipmentScheduleCreateRequest,
  EquipmentScheduleUpdateRequest,
  ScheduleListResponse,
  EquipmentAvailability,
  ScheduleFilters,
  ScheduleConflict
} from '../types/scheduling'

const BASE_URL = '/api/v1/scheduling'

// List schedules with filters
export function useScheduleList(filters?: ScheduleFilters) {
  const params = new URLSearchParams()
  
  if (filters?.equipment_id) params.append('equipment_id', filters.equipment_id.toString())
  if (filters?.project_id) params.append('project_id', filters.project_id.toString())
  if (filters?.operator_id) params.append('operator_id', filters.operator_id.toString())
  if (filters?.status) params.append('status', filters.status)
  if (filters?.start_date) params.append('start_date', filters.start_date)
  if (filters?.end_date) params.append('end_date', filters.end_date)
  
  const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL
  
  return useSWR<ScheduleListResponse>(url, fetcher)
}

// Get single schedule
export function useSchedule(id: number) {
  return useSWR<EquipmentSchedule>(id ? `${BASE_URL}/${id}` : null, fetcher)
}

// Create new schedule
export function useCreateSchedule() {
  const { trigger, isMutating, error } = useSWRMutation(
    BASE_URL,
    async (url: string, { arg }: { arg: EquipmentScheduleCreateRequest }) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(arg),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create schedule: ${response.statusText}`)
      }
      
      return response.json()
    }
  )

  return {
    createSchedule: trigger,
    isCreating: isMutating,
    error,
  }
}

// Update existing schedule
export function useUpdateSchedule() {
  const { trigger, isMutating, error } = useSWRMutation(
    BASE_URL,
    async (url: string, { arg }: { arg: { id: number; data: EquipmentScheduleUpdateRequest } }) => {
      const response = await fetch(`${url}/${arg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(arg.data),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update schedule: ${response.statusText}`)
      }
      
      return response.json()
    }
  )

  return {
    updateSchedule: trigger,
    isUpdating: isMutating,
    error,
  }
}

// Delete schedule
export function useDeleteSchedule() {
  const { trigger, isMutating, error } = useSWRMutation(
    BASE_URL,
    async (url: string, { arg }: { arg: number }) => {
      const response = await fetch(`${url}/${arg}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete schedule: ${response.statusText}`)
      }
      
      return response.json()
    }
  )

  return {
    deleteSchedule: trigger,
    isDeleting: isMutating,
    error,
  }
}

// Check equipment availability
export function useEquipmentAvailability(equipmentId: number, startDate: string, endDate: string) {
  const url = equipmentId && startDate && endDate 
    ? `/api/v1/scheduling/equipment/${equipmentId}/availability?start_date=${startDate}&end_date=${endDate}` 
    : null
  return useSWR<EquipmentAvailability>(url, fetcher)
}

// Check for scheduling conflicts
export function useScheduleConflicts(equipmentId: number, startDate: string, endDate: string, excludeScheduleId?: number) {
  const params = new URLSearchParams({
    equipment_id: equipmentId.toString(),
    start_datetime: startDate,
    end_datetime: endDate,
  })
  
  if (excludeScheduleId) {
    params.append('exclude_schedule_id', excludeScheduleId.toString())
  }
  
  const url = equipmentId && startDate && endDate 
    ? `/api/v1/scheduling/conflicts/check?${params.toString()}`
    : null
    
  return useSWR<ScheduleConflict[]>(url, fetcher)
}

// Get schedules for calendar view
export function useCalendarSchedules(startDate: string, endDate: string, equipmentIds?: number[]) {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    format: 'calendar'
  })
  
  if (equipmentIds && equipmentIds.length > 0) {
    equipmentIds.forEach(id => params.append('equipment_id', id.toString()))
  }
  
  const url = `/api/v1/scheduling?${params.toString()}`
  return useSWR<EquipmentSchedule[]>(url, fetcher)
}

// Get schedule statistics
export function useScheduleStats(filters?: Omit<ScheduleFilters, 'page' | 'per_page'>) {
  const params = new URLSearchParams()
  
  if (filters?.equipment_id) params.append('equipment_id', filters.equipment_id.toString())
  if (filters?.start_date) params.append('start_date', filters.start_date)
  if (filters?.end_date) params.append('end_date', filters.end_date)
  
  const url = `/api/v1/scheduling/equipment/${filters?.equipment_id}/statistics?${params.toString()}`
  
  return useSWR<{
    total_schedules: number
    active_schedules: number
    upcoming_schedules: number
    completed_schedules: number
    utilization_rate: number
    average_schedule_duration: number
  }>(url, fetcher)
}
