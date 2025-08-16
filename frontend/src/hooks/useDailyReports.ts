/**
 * Daily Reports SWR Hooks
 * Custom hooks for managing daily reports data with SWR
 */

import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import DailyReportsAPI from '../services/daily-reports';
import type {
  DailyReportCreate,
  DailyReportUpdate,
  DailyReportFilters,
} from '../types/daily-report';

// SWR keys for cache management
export const dailyReportsKeys = {
  all: ['daily-reports'] as const,
  profile: () => [...dailyReportsKeys.all, 'profile'] as const,
  reports: () => [...dailyReportsKeys.all, 'reports'] as const,
  reportsList: (filters?: DailyReportFilters) =>
    [...dailyReportsKeys.reports(), 'list', filters] as const,
  report: (id: number) =>
    [...dailyReportsKeys.reports(), 'detail', id] as const,
  equipment: () => [...dailyReportsKeys.all, 'equipment'] as const,
};

/**
 * Get operator profile
 */
export function useOperatorProfile() {
  return useSWR(
    dailyReportsKeys.profile(),
    () => DailyReportsAPI.getProfile(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );
}

/**
 * Get daily reports with optional filters
 */
export function useDailyReports(filters?: DailyReportFilters) {
  return useSWR(
    dailyReportsKeys.reportsList(filters),
    () => DailyReportsAPI.getReports(filters),
    {
      revalidateOnFocus: true,
      refreshInterval: 60000, // Refresh every minute
    }
  );
}

/**
 * Get specific daily report
 */
export function useDailyReport(reportId: number | null) {
  return useSWR(
    reportId ? dailyReportsKeys.report(reportId) : null,
    reportId ? () => DailyReportsAPI.getReport(reportId) : null,
    {
      revalidateOnFocus: false,
    }
  );
}

/**
 * Get available equipment
 */
export function useAvailableEquipment() {
  return useSWR(
    dailyReportsKeys.equipment(),
    () => DailyReportsAPI.getAvailableEquipment(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes
    }
  );
}

/**
 * Create daily report mutation
 */
export function useCreateDailyReport() {
  const { trigger, isMutating, error } = useSWRMutation(
    dailyReportsKeys.reports(),
    async (key, { arg }: { arg: DailyReportCreate }) => {
      const result = await DailyReportsAPI.createReport(arg);
      return result;
    },
    {
      onSuccess: () => {
        // Revalidate reports list
        mutate(dailyReportsKeys.reports());
      },
    }
  );

  return {
    createReport: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Update daily report mutation
 */
export function useUpdateDailyReport() {
  const { trigger, isMutating, error } = useSWRMutation(
    dailyReportsKeys.reports(),
    async (key, { arg }: { arg: { id: number; data: DailyReportUpdate } }) => {
      const result = await DailyReportsAPI.updateReport(arg.id, arg.data);
      return result;
    },
    {
      onSuccess: (data) => {
        // Revalidate specific report and reports list
        mutate(dailyReportsKeys.report(data.id));
        mutate(dailyReportsKeys.reports());
      },
    }
  );

  return {
    updateReport: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Submit daily report mutation
 */
export function useSubmitDailyReport() {
  const { trigger, isMutating, error } = useSWRMutation(
    dailyReportsKeys.reports(),
    async (key, { arg }: { arg: number }) => {
      const result = await DailyReportsAPI.submitReport(arg);
      return { ...result, reportId: arg };
    },
    {
      onSuccess: (data) => {
        if (data && 'reportId' in data) {
          // Revalidate specific report and reports list
          mutate(dailyReportsKeys.report(data.reportId as number));
        }
        mutate(dailyReportsKeys.reports());
      },
    }
  );

  return {
    submitReport: trigger,
    isSubmitting: isMutating,
    error,
  };
}

/**
 * Delete daily report mutation
 */
export function useDeleteDailyReport() {
  const { trigger, isMutating, error } = useSWRMutation(
    dailyReportsKeys.reports(),
    async (key, { arg }: { arg: number }) => {
      const result = await DailyReportsAPI.deleteReport(arg);
      return result;
    },
    {
      onSuccess: () => {
        // Revalidate reports list
        mutate(dailyReportsKeys.reports());
      },
    }
  );

  return {
    deleteReport: trigger,
    isDeleting: isMutating,
    error,
  };
}

/**
 * Upload photos mutation
 */
export function useUploadPhotos() {
  const { trigger, isMutating, error } = useSWRMutation(
    dailyReportsKeys.reports(),
    async (key, { arg }: { arg: { reportId: number; files: File[] } }) => {
      const result = await DailyReportsAPI.uploadPhotos(
        arg.reportId,
        arg.files
      );
      return { ...result, reportId: arg.reportId };
    },
    {
      onSuccess: (data) => {
        if (data && 'reportId' in data) {
          // Revalidate specific report
          mutate(dailyReportsKeys.report(data.reportId as number));
        }
      },
    }
  );

  return {
    uploadPhotos: trigger,
    isUploading: isMutating,
    error,
  };
}

/**
 * Get current location hook
 */
export function useCurrentLocation() {
  return useSWR(
    ['location', 'current'],
    () => DailyReportsAPI.getCurrentLocation(),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      errorRetryCount: 1,
    }
  );
}

/**
 * Helper hook for real-time report updates
 */
export function useReportPolling(reportId: number | null, enabled = false) {
  return useSWR(
    enabled && reportId ? dailyReportsKeys.report(reportId) : null,
    reportId ? () => DailyReportsAPI.getReport(reportId) : null,
    {
      refreshInterval: enabled ? 5000 : 0, // Poll every 5 seconds when enabled
      revalidateOnFocus: false,
    }
  );
}

/**
 * Get today's reports
 */
export function useTodayReports() {
  const today = new Date().toISOString().split('T')[0];

  return useDailyReports({
    date_from: today,
    date_to: today,
    limit: 20,
  });
}

/**
 * Get recent reports (last 7 days)
 */
export function useRecentReports() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return useDailyReports({
    date_from: oneWeekAgo.toISOString().split('T')[0],
    limit: 50,
  });
}

/**
 * Get draft reports
 */
export function useDraftReports() {
  return useDailyReports({
    status: 'draft',
    limit: 20,
  });
}

/**
 * Get pending reports (submitted but not approved)
 */
export function usePendingReports() {
  return useDailyReports({
    status: 'submitted',
    limit: 50,
  });
}
