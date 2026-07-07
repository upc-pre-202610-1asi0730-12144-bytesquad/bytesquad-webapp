import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DashboardApi }              from '../infrastructure/dashboard-api.js';
import { useActivityReportStore }    from '@/analytics/application/activity-report.store.js';
import { useMaintenanceQuoteStore }  from '@/analytics/application/maintenance-quote.store.js';
import { useRoiProjectionStore }     from '@/analytics/application/roi-projection.store.js';
import { useEquipmentStore }         from '@/gym/application/equipment.store.js';
import { useAuthStore }              from '@/authentication/application/auth.store.js';

const api = new DashboardApi();

export const useDashboardStore = defineStore('dashboard', () => {
  const loading      = ref(false);
  const error        = ref(null);
  const usageStats   = ref([]);  // EquipmentUsageStat[]
  const peakCapacity = ref([]);  // { hour, reservationCount, totalMinutes }[]

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

  const machineUsageBars = computed(() => {
    const equipment = useEquipmentStore().equipment;
    return [...usageStats.value]
      .sort((a, b) => b.totalUsageHours - a.totalUsageHours)
      .slice(0, 8)
      .map(s => ({
        name:             equipment.find(e => e.id === s.equipmentId)?.name ?? `EQ-${s.equipmentId}`,
        totalUsageHours:  s.totalUsageHours,
        reservationCount: s.reservationCount,
      }));
  });

  const maxUsageHours = computed(() =>
    Math.max(...machineUsageBars.value.map(b => b.totalUsageHours), 1)
  );

  const peakHours = computed(() =>
    [...peakCapacity.value].sort((a, b) => a.hour - b.hour)
  );

  const maxReservations = computed(() =>
    Math.max(...peakHours.value.map(h => h.reservationCount), 1)
  );

  async function load() {
    const adminId = useAuthStore().user?.id;
    if (!adminId) return;
    loading.value = true; error.value = null;
    try {
      const [stats, peak] = await Promise.all([
        api.getUsageStatsByAdmin(adminId),
        api.getPeakCapacityByAdmin(adminId),
        activityReportStore.loadByAdmin(adminId),
        maintenanceQuoteStore.loadByAdmin(adminId),
        roiProjectionStore.loadByAdmin(adminId),
      ]);
      usageStats.value   = stats;
      peakCapacity.value = peak;
    } catch (e) {
      error.value = e.message || 'Failed to load dashboard data';
    } finally { loading.value = false; }
  }

  return {
    loading, error,
    activityReports, maintenanceQuotes, roiProjections,
    latestActivityReport, latestMaintenanceQuote, latestRoiProjection,
    usageStats, peakCapacity,
    machineUsageBars, maxUsageHours,
    peakHours, maxReservations,
    load,
  };
});
