import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AnomalyApi } from '../infrastructure/anomaly-api.js';

const api = new AnomalyApi();

export const useAnomalyStore = defineStore('anomaly', () => {
  // No GET endpoint exists for anomalies — this only accumulates reports
  // the client successfully submits during this session.
  const reports = ref([]);
  const loading = ref(false);
  const error   = ref(null);

  async function reportAnomaly(resource) {
    loading.value = true; error.value = null;
    try {
      const created = await api.reportAnomaly(resource);
      reports.value = [created, ...reports.value];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to report anomaly';
    } finally { loading.value = false; }
  }

  return { reports, loading, error, reportAnomaly };
});
