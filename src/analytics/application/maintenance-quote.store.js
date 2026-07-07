import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MaintenanceQuoteApi } from '../infrastructure/maintenance-quote-api.js';

const api = new MaintenanceQuoteApi();

export const useMaintenanceQuoteStore = defineStore('maintenanceQuote', () => {
  const quotes  = ref([]);
  const loading = ref(false);
  const error   = ref(null);

  function _upsert(quote) {
    const idx = quotes.value.findIndex(q => q.maintenanceQuoteId === quote.maintenanceQuoteId);
    if (idx >= 0) quotes.value = quotes.value.map(q => q.maintenanceQuoteId === quote.maintenanceQuoteId ? quote : q);
    else quotes.value = [quote, ...quotes.value];
  }

  async function createQuote(correctiveActionsCost) {
    loading.value = true; error.value = null;
    try {
      const created = await api.create(correctiveActionsCost);
      _upsert(created);
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create maintenance quote';
    } finally { loading.value = false; }
  }

  async function updateSparePartsCost(maintenanceQuoteId, sparePartsCost) {
    try {
      _upsert(await api.updateSparePartsCost(maintenanceQuoteId, sparePartsCost));
    } catch (e) { error.value = e.message; }
  }

  async function updatePreventiveCost(maintenanceQuoteId, preventiveCost) {
    try {
      _upsert(await api.updatePreventiveCost(maintenanceQuoteId, preventiveCost));
    } catch (e) { error.value = e.message; }
  }

  async function consolidateTotal(maintenanceQuoteId) {
    try {
      _upsert(await api.consolidateTotal(maintenanceQuoteId));
    } catch (e) { error.value = e.message; }
  }

  async function loadByAdmin(adminId) {
    loading.value = true; error.value = null;
    try {
      quotes.value = await api.getByAdmin(adminId);
    } catch (e) {
      error.value = e.message || 'Failed to load maintenance quotes';
    } finally { loading.value = false; }
  }

  return { quotes, loading, error, createQuote, updateSparePartsCost, updatePreventiveCost, consolidateTotal, loadByAdmin };
});
