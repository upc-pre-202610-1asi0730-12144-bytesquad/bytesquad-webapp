import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AlertsApi } from '../infrastructure/alerts-api.js';

const api = new AlertsApi();

export const useAlertsStore = defineStore('alerts', () => {
  const alerts  = ref([]);
  const loading = ref(false);
  const error   = ref(null);

  const unresolvedCount = computed(() => alerts.value.filter(a => !a.resolved).length);

  async function load() {
    loading.value = true; error.value = null;
    try {
      alerts.value = await api.getMine();
    } catch (e) {
      error.value = e.message || 'Failed to load alerts';
    } finally { loading.value = false; }
  }

  async function resolve(alertId) {
    try {
      const updated = await api.resolve(alertId);
      alerts.value = alerts.value.map(a => a.id === updated.id ? updated : a);
    } catch (e) {
      error.value = e.message || 'Failed to resolve alert';
    }
  }

  return { alerts, loading, error, unresolvedCount, load, resolve };
});
