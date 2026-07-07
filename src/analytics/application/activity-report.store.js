import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ActivityReportApi } from '../infrastructure/activity-report-api.js';

const api = new ActivityReportApi();

export const useActivityReportStore = defineStore('activityReport', () => {
  const activityReports = ref([]);
  const loading         = ref(false);
  const error           = ref(null);

  function _upsert(report) {
    const idx = activityReports.value.findIndex(r => r.activityReportId === report.activityReportId);
    if (idx >= 0) activityReports.value = activityReports.value.map(r => r.activityReportId === report.activityReportId ? report : r);
    else activityReports.value = [report, ...activityReports.value];
  }

  async function createReport(totalUsageTime, downtimeCost, percentageComparison) {
    loading.value = true; error.value = null;
    try {
      const created = await api.create(totalUsageTime, downtimeCost, percentageComparison);
      _upsert(created);
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create activity report';
    } finally { loading.value = false; }
  }

  async function updateUsageTime(activityReportId, totalUsageTime) {
    try {
      _upsert(await api.updateUsageTime(activityReportId, totalUsageTime));
    } catch (e) { error.value = e.message; }
  }

  async function updateDowntimeCost(activityReportId, downtimeCost) {
    try {
      _upsert(await api.updateDowntimeCost(activityReportId, downtimeCost));
    } catch (e) { error.value = e.message; }
  }

  async function updatePercentageComparison(activityReportId, percentageComparison) {
    try {
      _upsert(await api.updatePercentageComparison(activityReportId, percentageComparison));
    } catch (e) { error.value = e.message; }
  }

  async function loadByAdmin(adminId) {
    loading.value = true; error.value = null;
    try {
      activityReports.value = await api.getByAdmin(adminId);
    } catch (e) {
      error.value = e.message || 'Failed to load activity reports';
    } finally { loading.value = false; }
  }

  return { activityReports, loading, error, createReport, updateUsageTime, updateDowntimeCost, updatePercentageComparison, loadByAdmin };
});
