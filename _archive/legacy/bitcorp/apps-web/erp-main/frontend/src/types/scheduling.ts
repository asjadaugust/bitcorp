export interface EquipmentSchedule {
  id: number;
  equipment_id: number;
  project_id?: number;
  operator_id?: number;
  start_datetime: string;
  end_datetime: string;
  status: ScheduleStatus;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;

  // Populated relations
  equipment?: {
    id: number;
    name: string;
    equipment_type: string;
    status: string;
  };
  project?: {
    id: number;
    name: string;
    client_name?: string;
  };
  operator?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export type ScheduleStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface EquipmentScheduleCreateRequest {
  equipment_id: number;
  project_id?: number;
  operator_id?: number;
  start_datetime: string;
  end_datetime: string;
  notes?: string;
}

export interface EquipmentScheduleUpdateRequest {
  project_id?: number;
  operator_id?: number;
  start_datetime?: string;
  end_datetime?: string;
  status?: ScheduleStatus;
  notes?: string;
}

export interface ScheduleConflict {
  equipment_id: number;
  conflicting_schedule_id: number;
  overlap_start: string;
  overlap_end: string;
  conflict_type: 'full_overlap' | 'partial_overlap';
}

export interface EquipmentAvailability {
  equipment_id: number;
  date: string;
  is_available: boolean;
  scheduled_hours: number;
  available_periods: Array<{
    start_time: string;
    end_time: string;
  }>;
  conflicts: ScheduleConflict[];
}

export interface ScheduleListResponse {
  schedules: EquipmentSchedule[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    equipment_id: number;
    equipment_name: string;
    project_name?: string;
    operator_name?: string;
  };
  color?: string;
  status: ScheduleStatus;
}

export interface ScheduleFilters {
  equipment_id?: number;
  project_id?: number;
  operator_id?: number;
  status?: ScheduleStatus;
  start_date?: string;
  end_date?: string;
}
