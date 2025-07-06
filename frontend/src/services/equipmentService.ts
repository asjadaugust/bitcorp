import { api } from '../lib/api'
import type {
  Equipment,
  EquipmentCreateRequest,
  EquipmentUpdateRequest,
  EquipmentListResponse,
  EquipmentSearchParams,
  EquipmentUtilization
} from '../types/equipment'
import { EquipmentStatus } from '../types/equipment'

class EquipmentService {
  private readonly baseUrl = '/api/v1/equipment'

  /**
   * Get paginated list of equipment with search and filtering
   */
  async getEquipment(params: EquipmentSearchParams = {}): Promise<EquipmentListResponse> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    const response = await api.get(`${this.baseUrl}?${searchParams.toString()}`)
    return response.data
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(id: number): Promise<Equipment> {
    const response = await api.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * Create new equipment
   */
  async createEquipment(equipment: EquipmentCreateRequest): Promise<Equipment> {
    const response = await api.post(this.baseUrl, equipment)
    return response.data
  }

  /**
   * Update equipment
   */
  async updateEquipment(id: number, equipment: EquipmentUpdateRequest): Promise<Equipment> {
    const response = await api.put(`${this.baseUrl}/${id}`, equipment)
    return response.data
  }

  /**
   * Delete equipment (soft delete)
   */
  async deleteEquipment(id: number): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * Update equipment status
   */
  async updateEquipmentStatus(id: number, status: EquipmentStatus): Promise<{
    message: string
    old_status: string
    new_status: string
  }> {
    const response = await api.patch(`${this.baseUrl}/${id}/status`, { new_status: status })
    return response.data
  }

  /**
   * Get equipment utilization statistics
   */
  async getEquipmentUtilization(id: number): Promise<EquipmentUtilization> {
    const response = await api.get(`${this.baseUrl}/${id}/utilization`)
    return response.data
  }

  /**
   * Get available equipment types
   */
  async getEquipmentTypes(): Promise<string[]> {
    const response = await api.get(`${this.baseUrl}/types/`)
    return response.data
  }

  /**
   * Get available equipment statuses
   */
  async getEquipmentStatuses(): Promise<string[]> {
    const response = await api.get(`${this.baseUrl}/statuses/`)
    return response.data
  }

  /**
   * Get available fuel types
   */
  async getFuelTypes(): Promise<string[]> {
    const response = await api.get(`${this.baseUrl}/fuel-types/`)
    return response.data
  }

  /**
   * Search equipment by name, model, brand, or serial number
   */
  async searchEquipment(query: string, limit = 10): Promise<Equipment[]> {
    const params = {
      search: query,
      per_page: limit
    }
    const response = await this.getEquipment(params)
    return response.equipment
  }

  /**
   * Get equipment by status
   */
  async getEquipmentByStatus(status: EquipmentStatus): Promise<Equipment[]> {
    const params = { status, per_page: 1000 }
    const response = await this.getEquipment(params)
    return response.equipment
  }

  /**
   * Get available equipment (not in use, maintenance, or retired)
   */
  async getAvailableEquipment(): Promise<Equipment[]> {
    return this.getEquipmentByStatus(EquipmentStatus.AVAILABLE)
  }

  /**
   * Get equipment statistics
   */
  async getEquipmentStats(): Promise<{
    total: number
    by_status: Record<EquipmentStatus, number>
    by_type: Record<string, number>
    total_value: number
    avg_utilization: number
  }> {
    // This would be implemented as a separate endpoint in a real application
    const allEquipment = await this.getEquipment({ per_page: 1000 })
    
    const stats = {
      total: allEquipment.total,
      by_status: {} as Record<EquipmentStatus, number>,
      by_type: {} as Record<string, number>,
      total_value: 0,
      avg_utilization: 0
    }

    // Initialize status counts
    Object.values(EquipmentStatus).forEach(status => {
      stats.by_status[status] = 0
    })

    // Calculate statistics
    allEquipment.equipment.forEach(equipment => {
      stats.by_status[equipment.status]++
      
      if (stats.by_type[equipment.equipment_type]) {
        stats.by_type[equipment.equipment_type]++
      } else {
        stats.by_type[equipment.equipment_type] = 1
      }
      
      if (equipment.current_value) {
        stats.total_value += equipment.current_value
      }
    })

    return stats
  }
}

// Export singleton instance
export const equipmentService = new EquipmentService()
export default equipmentService
