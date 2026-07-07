import { defineStore } from 'pinia';
import { ref }         from 'vue';
import { AuthorizedDniApi } from '../infrastructure/authorized-dni-api.js';

const api = new AuthorizedDniApi();

export const useAuthorizedDniStore = defineStore('authorizedDni', () => {
  const dnis    = ref([]);
  const loading = ref(false);
  const error   = ref(null);

  async function load(gymId) {
    loading.value = true; error.value = null;
    try {
      dnis.value = await api.getAll(gymId);
    } catch (e) {
      error.value = e.message || 'Failed to load authorized DNIs';
    } finally { loading.value = false; }
  }

  async function add(gymId, dni) {
    loading.value = true; error.value = null;
    try {
      const created = await api.add(gymId, dni);
      dnis.value = [...dnis.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to add DNI';
      throw e; // re-throw so the view can inspect e.status for i18n
    } finally { loading.value = false; }
  }

  async function remove(gymId, dni) {
    loading.value = true; error.value = null;
    try {
      await api.remove(gymId, dni);
      dnis.value = dnis.value.filter(d => d.dni !== dni);
    } catch (e) {
      error.value = e.message || 'Failed to remove DNI';
      throw e;
    } finally { loading.value = false; }
  }

  return { dnis, loading, error, load, add, remove };
});
