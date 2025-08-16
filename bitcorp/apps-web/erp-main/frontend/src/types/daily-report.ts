// Daily Report types for the operator module

export interface DailyReport {
  id: number;
  report_date: string;
  shift_start: string;
  shift_end?: string;
  operator_id: number;
  operator_name: string;
  equipment_id: number;
  equipment_code: string;
  equipment_name: string;
  project_name: string;
  site_location: string;
  work_zone?: string;
  initial_hourmeter: number;
  initial_odometer?: number;
  initial_fuel_level?: number;
  final_hourmeter?: number;
  final_odometer?: number;
  final_fuel_level?: number;
  hours_worked?: number;
  distance_traveled?: number;
  fuel_consumed?: number;
  activities_performed?: string;
  work_description?: string;
  equipment_issues?: string;
  maintenance_needed: boolean;
  safety_incidents?: string;
  weather_conditions?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  photos?: string;
  start_latitude?: number;
  start_longitude?: number;
  end_latitude?: number;
  end_longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface DailyReportCreate {
  report_date: string;
  shift_start: string;
  shift_end?: string;
  equipment_id: number;
  project_name: string;
  site_location: string;
  work_zone?: string;
  initial_hourmeter: number;
  initial_odometer?: number;
  initial_fuel_level?: number;
  final_hourmeter?: number;
  final_odometer?: number;
  final_fuel_level?: number;
  activities_performed?: string;
  work_description?: string;
  equipment_issues?: string;
  maintenance_needed?: boolean;
  safety_incidents?: string;
  weather_conditions?: string;
  start_latitude?: number;
  start_longitude?: number;
  end_latitude?: number;
  end_longitude?: number;
}

export interface DailyReportUpdate {
  shift_end?: string;
  final_hourmeter?: number;
  final_odometer?: number;
  final_fuel_level?: number;
  activities_performed?: string;
  work_description?: string;
  equipment_issues?: string;
  maintenance_needed?: boolean;
  safety_incidents?: string;
  weather_conditions?: string;
  end_latitude?: number;
  end_longitude?: number;
}

export interface OperatorProfile {
  id: number;
  user_id: number;
  employee_id: string;
  phone_number?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  license_number?: string;
  license_expiry?: string;
  certifications?: string;
  equipment_skills?: string;
  hire_date?: string;
  hourly_rate?: number;
  employment_status: string;
  total_hours_worked: number;
  total_reports_submitted: number;
  average_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface DailyReportFilters {
  date_from?: string;
  date_to?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface WeatherCondition {
  value: string;
  label: string;
  icon: string;
}

export const WEATHER_CONDITIONS: WeatherCondition[] = [
  { value: 'sunny', label: 'Soleado', icon: '☀️' },
  { value: 'cloudy', label: 'Nublado', icon: '☁️' },
  { value: 'rainy', label: 'Lluvioso', icon: '🌧️' },
  { value: 'stormy', label: 'Tormentoso', icon: '⛈️' },
  { value: 'foggy', label: 'Neblinoso', icon: '🌫️' },
  { value: 'windy', label: 'Ventoso', icon: '💨' },
  { value: 'hot', label: 'Caluroso', icon: '🌡️' },
  { value: 'cold', label: 'Frío', icon: '❄️' },
];

export interface EquipmentOption {
  id: number;
  name: string;
  code: string;
  type: string;
  status: string;
}

export interface ProjectOption {
  id: number;
  name: string;
  location: string;
  status: string;
}

// Status labels and colors
export const REPORT_STATUS_CONFIG = {
  draft: {
    label: 'Borrador',
    color: 'default' as const,
    icon: '📝',
  },
  submitted: {
    label: 'Enviado',
    color: 'primary' as const,
    icon: '📤',
  },
  approved: {
    label: 'Aprobado',
    color: 'success' as const,
    icon: '✅',
  },
  rejected: {
    label: 'Rechazado',
    color: 'error' as const,
    icon: '❌',
  },
} as const;
