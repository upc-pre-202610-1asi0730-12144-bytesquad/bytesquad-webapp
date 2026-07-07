import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useActivityReportStore }   from '@/analytics/application/activity-report.store.js';
import { useMaintenanceQuoteStore } from '@/analytics/application/maintenance-quote.store.js';
import { useRoiProjectionStore }    from '@/analytics/application/roi-projection.store.js';
import { useAuthStore }             from '@/authentication/application/auth.store.js';

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(false);
  const error   = ref(null);

  const activityReportStore   = useActivityReportStore();
  const maintenanceQuoteStore = useMaintenanceQuoteStore();
  const roiProjectionStore    = useRoiProjectionStore();

  function _byDateDesc(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }

  const activityReports = computed(() =>
    [...activityReportStore.activityReports].sort(_byDateDesc)
  );
  const maintenanceQuotes = computed(() =>
    [...maintenanceQuoteStore.quotes].sort(_byDateDesc)
  );
  const roiProjections = computed(() =>
    [...roiProjectionStore.projections].sort(_byDateDesc)
  );

  const latestActivityReport   = computed(() => activityReports.value[0]   ?? null);
  const latestMaintenanceQuote = computed(() => maintenanceQuotes.value[0] ?? null);
  const latestRoiProjection    = computed(() => roiProjections.value[0]    ?? null);

  async function load() {
    const adminId = useAuthStore().user?.id;
    if (!adminId) return;
    loading.value = true; error.value = null;
    try {
      await Promise.all([
        activityReportStore.loadByAdmin(adminId),
        maintenanceQuoteStore.loadByAdmin(adminId),
        roiProjectionStore.loadByAdmin(adminId),
      ]);
    } catch (e) {
      error.value = e.message || 'Failed to load dashboard data';
    } finally { loading.value = false; }
  }

  return {
    loading, error,
    activityReports, maintenanceQuotes, roiProjections,
    latestActivityReport, latestMaintenanceQuote, latestRoiProjection,
    load,
  };
});
