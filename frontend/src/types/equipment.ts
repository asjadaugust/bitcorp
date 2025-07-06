// Equipment type definitions
export interface Equipment {
  id: number
  company_id: number
  name: string
  model?: string
  brand?: string
  equipment_type: EquipmentType
  serial_number?: string
  year_manufactured?: number
  purchase_cost?: number
  current_value?: number
  hourly_rate?: number
  fuel_type?: FuelType
  fuel_capacity?: number
  status: EquipmentStatus
  hourmeter_reading: number
  odometer_reading: number
  specifications: Record<string, string | number | boolean>
  images: string[]
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export enum EquipmentStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
  OUT_OF_ORDER = 'out_of_order'
}

export enum EquipmentType {
  EXCAVATOR = 'excavator',
  BULLDOZER = 'bulldozer',
  LOADER = 'loader',
  CRANE = 'crane',
  TRUCK = 'truck',
  GENERATOR = 'generator',
  COMPACTOR = 'compactor',
  GRADER = 'grader',
  OTHER = 'other'
}

export enum FuelType {
  DIESEL = 'diesel',
  GASOLINE = 'gasoline',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  PROPANE = 'propane'
}

export interface EquipmentCreateRequest {
  company_id: number
  name: string
  model?: string
  brand?: string
  equipment_type: EquipmentType
  serial_number?: string
  year_manufactured?: number
  purchase_cost?: number
  current_value?: number
  hourly_rate?: number
  fuel_type?: FuelType
  fuel_capacity?: number
  specifications?: Record<string, string | number | boolean>
  notes?: string
}

export interface EquipmentUpdateRequest {
  name?: string
  model?: string
  brand?: string
  equipment_type?: EquipmentType
  serial_number?: string
  year_manufactured?: number
  purchase_cost?: number
  current_value?: number
  hourly_rate?: number
  fuel_type?: FuelType
  fuel_capacity?: number
  status?: EquipmentStatus
  hourmeter_reading?: number
  odometer_reading?: number
  specifications?: Record<string, string | number | boolean>
  notes?: string
}

export interface EquipmentListResponse {
  equipment: Equipment[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface EquipmentSearchParams {
  page?: number
  per_page?: number
  search?: string
  equipment_type?: EquipmentType
  status?: EquipmentStatus
  brand?: string
  min_hourly_rate?: number
  max_hourly_rate?: number
  year_from?: number
  year_to?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface EquipmentUtilization {
  equipment_id: number
  total_hours: number
  utilization_percentage: number
  days_since_last_maintenance: number
  revenue_generated: number
}

// Helper functions
export const getStatusColor = (status: EquipmentStatus) => {
  switch (status) {
    case EquipmentStatus.AVAILABLE:
      return 'success'
    case EquipmentStatus.IN_USE:
      return 'info'
    case EquipmentStatus.MAINTENANCE:
      return 'warning'
    case EquipmentStatus.RETIRED:
      return 'secondary'
    case EquipmentStatus.OUT_OF_ORDER:
      return 'error'
    default:
      return 'default'
  }
}

export const getStatusLabel = (status: EquipmentStatus) => {
  switch (status) {
    case EquipmentStatus.AVAILABLE:
      return 'Available'
    case EquipmentStatus.IN_USE:
      return 'In Use'
    case EquipmentStatus.MAINTENANCE:
      return 'Maintenance'
    case EquipmentStatus.RETIRED:
      return 'Retired'
    case EquipmentStatus.OUT_OF_ORDER:
      return 'Out of Order'
    default:
      return status
  }
}

export const getEquipmentTypeLabel = (type: EquipmentType) => {
  switch (type) {
    case EquipmentType.EXCAVATOR:
      return 'Excavator'
    case EquipmentType.BULLDOZER:
      return 'Bulldozer'
    case EquipmentType.LOADER:
      return 'Loader'
    case EquipmentType.CRANE:
      return 'Crane'
    case EquipmentType.TRUCK:
      return 'Truck'
    case EquipmentType.GENERATOR:
      return 'Generator'
    case EquipmentType.COMPACTOR:
      return 'Compactor'
    case EquipmentType.GRADER:
      return 'Grader'
    case EquipmentType.OTHER:
      return 'Other'
    default:
      return type
  }
}

export const getFuelTypeLabel = (fuelType: FuelType) => {
  switch (fuelType) {
    case FuelType.DIESEL:
      return 'Diesel'
    case FuelType.GASOLINE:
      return 'Gasoline'
    case FuelType.ELECTRIC:
      return 'Electric'
    case FuelType.HYBRID:
      return 'Hybrid'
    case FuelType.PROPANE:
      return 'Propane'
    default:
      return fuelType
  }
}
