/**
 * IoT Dashboard SWR Hooks
 * Premium predictive maintenance data fetching
 */
import useSWR from 'swr';
import { swrFetcher } from '@/lib/swr-fetcher';

// Cache key factories
export const iotKeys = {
  all: ['iot'] as const,
  equipment: (equipmentId: number) =>
    [...iotKeys.all, 'equipment', equipmentId] as const,
  dashboard: (equipmentId: number) =>
    [...iotKeys.equipment(equipmentId), 'dashboard'] as const,
  alerts: (equipmentId: number) =>
    [...iotKeys.equipment(equipmentId), 'alerts'] as const,
  fleetAnalytics: ['iot', 'fleet-analytics'] as const,
  pricing: ['iot', 'pricing'] as const,
  devices: (equipmentId: number) =>
    [...iotKeys.equipment(equipmentId), 'devices'] as const,
};

// Type definitions
interface HealthScore {
  overall: number;
  engine: number;
  hydraulic: number;
  transmission: number;
  electrical: number;
  structural: number;
  last_analysis: string | null;
}

interface Alert {
  id: number;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  action: string;
  created: string;
}

interface SensorData {
  current: number;
  average: number;
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
  latest_timestamp: string;
}

interface IoTDevice {
  id: number;
  device_id: string;
  type: string;
  status: 'online' | 'offline';
  last_communication: string | null;
}

interface PredictedSavings {
  annual_savings: number;
  monthly_savings: number;
  breakdown: {
    breakdown_prevention: number;
    early_detection: number;
    fuel_efficiency: number;
    extended_lifespan: number;
  };
  roi_multiple: number;
}

export interface EquipmentDashboardData {
  equipment_id: number;
  health_score: HealthScore;
  alerts: Alert[];
  sensor_summary: Record<string, SensorData>;
  iot_devices: IoTDevice[];
  predicted_savings: PredictedSavings;
}

export interface FleetAnalyticsData {
  total_equipment: number;
  monitored_equipment: number;
  fleet_health_average: number;
  total_active_alerts: number;
  critical_alerts: number;
  total_predicted_savings: number;
  equipment_status: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

export interface MaintenanceAlert {
  id: number;
  equipment_id: number;
  alert_type: string;
  severity: string;
  message: string;
  recommended_action: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
  resolved_by?: number;
  resolution_notes?: string;
}

export interface IoTPricingInfo {
  current_plan: string;
  iot_features: Record<string, string>;
  roi_calculation: {
    monthly_cost: number;
    annual_cost: number;
    typical_savings: number;
    roi_multiple: number;
    payback_period_days: number;
  };
  trial_available: boolean;
  setup_included: boolean;
}

// Hook for equipment IoT dashboard data
export function useEquipmentIoTDashboard(equipmentId: number) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: refetch,
  } = useSWR(
    iotKeys.dashboard(equipmentId),
    () =>
      swrFetcher<EquipmentDashboardData>(
        `/iot/equipment/${equipmentId}/dashboard`
      ),
    {
      refreshInterval: 30000, // Refresh every 30 seconds for real-time monitoring
      revalidateOnFocus: true,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    refetch,
  };
}

// Hook for equipment maintenance alerts
export function useEquipmentAlerts(
  equipmentId: number,
  includeResolved = false
) {
  return useSWR(
    [...iotKeys.alerts(equipmentId), includeResolved],
    () =>
      swrFetcher<MaintenanceAlert[]>(
        `/iot/equipment/${equipmentId}/alerts?include_resolved=${includeResolved}`
      ),
    {
      refreshInterval: 60000, // Refresh every minute for alerts
      revalidateOnFocus: true,
    }
  );
}

// Hook for fleet-wide IoT analytics
export function useFleetAnalytics() {
  return useSWR(
    iotKeys.fleetAnalytics,
    () => swrFetcher<FleetAnalyticsData>('/iot/fleet/analytics'),
    {
      refreshInterval: 120000, // Refresh every 2 minutes for fleet data
      revalidateOnFocus: true,
    }
  );
}

// Hook for IoT pricing information
export function useIoTPricing() {
  return useSWR(
    iotKeys.pricing,
    () => swrFetcher<IoTPricingInfo>('/iot/subscription/iot-pricing'),
    {
      revalidateOnFocus: false, // Pricing info doesn't change frequently
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );
}

// Hook for IoT devices status
export function useIoTDevices(equipmentId: number) {
  return useSWR(
    iotKeys.devices(equipmentId),
    () => swrFetcher<IoTDevice[]>(`/iot/equipment/${equipmentId}/devices`),
    {
      refreshInterval: 60000, // Refresh every minute for device status
      revalidateOnFocus: true,
    }
  );
}

// Mutation functions for IoT actions
export const iotMutations = {
  // Register new IoT device
  registerDevice: async (deviceData: {
    equipment_id: number;
    device_id: string;
    device_type?: string;
    manufacturer?: string;
    model?: string;
    firmware_version?: string;
    configuration?: Record<string, unknown>;
  }) => {
    const response = await fetch('/api/v1/iot/devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(deviceData),
    });

    if (!response.ok) {
      throw new Error('Failed to register IoT device');
    }

    return response.json();
  },

  // Submit sensor readings
  submitSensorData: async (
    deviceId: string,
    readings: Array<{
      sensor_type: string;
      value: number;
      unit?: string;
      timestamp?: string;
      metadata?: Record<string, unknown>;
    }>
  ) => {
    const response = await fetch(`/api/v1/iot/sensor-data/${deviceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(readings),
    });

    if (!response.ok) {
      throw new Error('Failed to submit sensor data');
    }

    return response.json();
  },

  // Resolve maintenance alert
  resolveAlert: async (alertId: number, resolutionNotes?: string) => {
    const response = await fetch(`/api/v1/iot/alerts/${alertId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ resolution_notes: resolutionNotes || '' }),
    });

    if (!response.ok) {
      throw new Error('Failed to resolve alert');
    }

    return response.json();
  },

  // Start IoT trial
  startTrial: async (equipmentIds: number[]) => {
    const response = await fetch('/api/v1/iot/trial/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ equipment_ids: equipmentIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to start IoT trial');
    }

    return response.json();
  },
};

const iotHooks = {
  useEquipmentIoTDashboard,
  useEquipmentAlerts,
  useFleetAnalytics,
  useIoTPricing,
  useIoTDevices,
  iotMutations,
  iotKeys,
};

export default iotHooks;
