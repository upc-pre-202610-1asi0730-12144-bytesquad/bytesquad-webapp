import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDashboardStore } from '@/dashboard/application/dashboard.store.js';

export const useAnalyticsStore = defineStore('analytics', () => {
  const dash = useDashboardStore();

  const totalUsageHours = computed(() =>
    Math.round(dash.usageStats.reduce((sum, s) => sum + (s.totalUsageHours ?? 0), 0))
  );

  const peakHour = computed(() => {
    if (!dash.peakHours.length) return null;
    return dash.peakHours.reduce((max, h) =>
      h.reservationCount > max.reservationCount ? h : max, dash.peakHours[0]
    );
  });

  return {
    get loading()                { return dash.loading; },
    get error()                  { return dash.error; },
    totalUsageHours,
    peakHour,
    get latestActivityReport()   { return dash.latestActivityReport; },
    get latestRoiProjection()    { return dash.latestRoiProjection; },
    get machineUsageBars()       { return dash.machineUsageBars; },
    get maxUsageHours()          { return dash.maxUsageHours; },
    get peakHours()              { return dash.peakHours; },
    get maxReservations()        { return dash.maxReservations; },
    get activityReports()        { return dash.activityReports; },
    get maintenanceQuotes()      { return dash.maintenanceQuotes; },
    get roiProjections()         { return dash.roiProjections; },
    load:                        () => dash.load(),
  };
});
