/**
 * SWR hooks for Reports and Analytics API
 * Provides data fetching and caching for reports functionality
 */

import useSWR from 'swr';
import { authenticatedFetcher } from '@/lib/swr-fetcher';

// Cache key factories for reports
export const reportsKeys = {
  all: ['reports'] as const,
  kpis: (dateRange: number) => [...reportsKeys.all, 'kpis', dateRange] as const,
  equipmentPerformance: (equipmentType?: string, dateRange?: number) =>
    [
      ...reportsKeys.all,
      'equipment-performance',
      { equipmentType, dateRange },
    ] as const,
  financialSummary: (dateRange: number) =>
    [...reportsKeys.all, 'financial-summary', dateRange] as const,
  availableReports: () => [...reportsKeys.all, 'available'] as const,
};

// Types for reports data
export interface KPIMetrics {
  equipment_utilization_rate: number;
  cost_savings_vs_rental: number;
  timesheet_completion_rate: number;
  daily_report_compliance: number;
  equipment_downtime: number;
  average_equipment_roi: number;
  date_range: number;
  last_updated: string;
}

export interface EquipmentPerformanceReport {
  id: number;
  equipment_name: string;
  equipment_type: string;
  utilization_rate: number;
  total_hours: number;
  cost_per_hour: number;
  total_cost: number;
  roi: number;
  status: string;
  last_maintenance?: string;
  next_maintenance?: string;
}

export interface FinancialSummary {
  total_operational_cost: number;
  total_revenue: number;
  cost_savings: number;
  budget_adherence: number;
  profit_margin: number;
  date_range: number;
  last_updated: string;
}

export interface ReportListItem {
  id: string;
  name: string;
  description: string;
  type: string;
  last_generated: string;
  format: string;
}

export interface ReportListResponse {
  reports: ReportListItem[];
  total_count: number;
}

export interface ReportRequest {
  report_type: string;
  date_from?: string;
  date_to?: string;
  equipment_filter?: string;
  format?: string;
  include_charts?: boolean;
  filters?: Record<string, unknown>;
}

export interface ReportResponse {
  report_id: string;
  report_type: string;
  status: string;
  file_url?: string;
  generated_at: string;
  file_size?: number;
  error_message?: string;
}

// SWR Hooks for Reports

/**
 * Hook to fetch KPI metrics
 */
export function useKPIMetrics(dateRange: number = 30) {
  return useSWR(
    reportsKeys.kpis(dateRange),
    () =>
      authenticatedFetcher<KPIMetrics>(`/reports/kpis?date_range=${dateRange}`),
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );
}

/**
 * Hook to fetch equipment performance data
 */
export function useEquipmentPerformance(
  equipmentType?: string,
  dateRange: number = 30
) {
  const params = new URLSearchParams();
  if (equipmentType) params.append('equipment_type', equipmentType);
  if (dateRange) params.append('date_range', dateRange.toString());

  return useSWR(
    reportsKeys.equipmentPerformance(equipmentType, dateRange),
    () =>
      authenticatedFetcher<EquipmentPerformanceReport[]>(
        `/reports/equipment-performance?${params.toString()}`
      ),
    {
      refreshInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    }
  );
}

/**
 * Hook to fetch financial summary
 */
export function useFinancialSummary(dateRange: number = 30) {
  return useSWR(
    reportsKeys.financialSummary(dateRange),
    () =>
      authenticatedFetcher<FinancialSummary>(
        `/reports/financial-summary?date_range=${dateRange}`
      ),
    {
      refreshInterval: 15 * 60 * 1000, // Refresh every 15 minutes
    }
  );
}

/**
 * Hook to fetch available reports
 */
export function useAvailableReports() {
  return useSWR(
    reportsKeys.availableReports(),
    () => authenticatedFetcher<ReportListResponse>('/reports/available'),
    {
      refreshInterval: 30 * 60 * 1000, // Refresh every 30 minutes
    }
  );
}

// Action functions for reports

/**
 * Generate a new report
 */
export async function generateReport(
  request: ReportRequest
): Promise<ReportResponse> {
  const response = await fetch('/api/v1/reports/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to generate report');
  }

  return response.json();
}

/**
 * Export report as PDF
 */
export async function exportReportPDF(
  reportType: string,
  dateRange: number = 30
): Promise<Blob> {
  const response = await fetch(
    `/api/v1/reports/export/${reportType}?date_range=${dateRange}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export report');
  }

  return response.blob();
}

/**
 * Download generated report
 */
export async function downloadReport(fileUrl: string): Promise<Blob> {
  const response = await fetch(fileUrl, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download report');
  }

  return response.blob();
}

// Utility functions

/**
 * Format currency values for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage values for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate trend indicator from value change
 */
export function getTrendIndicator(change: string): 'up' | 'down' | 'stable' {
  if (change.startsWith('+')) return 'up';
  if (change.startsWith('-')) return 'down';
  return 'stable';
}

/**
 * Get color based on performance metric
 */
export function getPerformanceColor(
  value: number,
  thresholds: { excellent: number; good: number; poor: number }
): 'success' | 'warning' | 'error' | 'default' {
  if (value >= thresholds.excellent) return 'success';
  if (value >= thresholds.good) return 'warning';
  if (value >= thresholds.poor) return 'error';
  return 'default';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}
