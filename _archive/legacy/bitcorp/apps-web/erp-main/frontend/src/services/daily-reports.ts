/**
 * Daily Reports API Service
 * Handles all API calls related to operator daily reports
 */

import { fetchWithAuth } from '../lib/api';
import type {
  DailyReport,
  DailyReportCreate,
  DailyReportUpdate,
  DailyReportFilters,
  OperatorProfile,
} from '../types/daily-report';

const BASE_URL = '/api/v1/daily-reports';

export class DailyReportsAPI {
  /**
   * Get operator profile
   */
  static async getProfile(): Promise<OperatorProfile> {
    const response = await fetchWithAuth(`${BASE_URL}/profile`);
    return response.json();
  }

  /**
   * Get operator's daily reports with optional filters
   */
  static async getReports(
    filters?: DailyReportFilters
  ): Promise<DailyReport[]> {
    const params = new URLSearchParams();

    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const url = params.toString()
      ? `${BASE_URL}/reports?${params.toString()}`
      : `${BASE_URL}/reports`;
    const response = await fetchWithAuth(url);
    return response.json();
  }

  /**
   * Get specific daily report by ID
   */
  static async getReport(reportId: number): Promise<DailyReport> {
    const response = await fetchWithAuth(`${BASE_URL}/reports/${reportId}`);
    return response.json();
  }

  /**
   * Create new daily report
   */
  static async createReport(data: DailyReportCreate): Promise<DailyReport> {
    const response = await fetchWithAuth(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Update existing daily report
   */
  static async updateReport(
    reportId: number,
    data: DailyReportUpdate
  ): Promise<DailyReport> {
    const response = await fetchWithAuth(`${BASE_URL}/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Submit report for approval
   */
  static async submitReport(reportId: number): Promise<{ message: string }> {
    const response = await fetchWithAuth(
      `${BASE_URL}/reports/${reportId}/submit`,
      {
        method: 'POST',
      }
    );
    return response.json();
  }

  /**
   * Delete daily report (only if draft)
   */
  static async deleteReport(reportId: number): Promise<{ message: string }> {
    const response = await fetchWithAuth(`${BASE_URL}/reports/${reportId}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  /**
   * Upload photos for daily report
   */
  static async uploadPhotos(
    reportId: number,
    files: File[]
  ): Promise<{ message: string; photo_urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetchWithAuth(
      `${BASE_URL}/reports/${reportId}/photos`,
      {
        method: 'POST',
        body: formData,
      }
    );
    return response.json();
  }

  /**
   * Get available equipment for reports
   */
  static async getAvailableEquipment(): Promise<
    { id: number; name: string; code: string; type: string }[]
  > {
    const response = await fetchWithAuth(
      '/api/v1/equipment?status=available&limit=100'
    );
    const data = await response.json();
    return data.equipment || [];
  }

  /**
   * Get current location using browser geolocation
   */
  static async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
  }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  /**
   * Format date for API consumption
   */
  static formatDateForAPI(date: Date): string {
    return date.toISOString();
  }

  /**
   * Format date from API response
   */
  static formatDateFromAPI(dateString: string): Date {
    return new Date(dateString);
  }
}

export default DailyReportsAPI;
