import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ProfilesApi } from '../infrastructure/profiles-api.js';

const api = new ProfilesApi();

export const useActiveGymStore = defineStore('activeGym', () => {
  const associations = ref([]);
  const loading      = ref(false);
  const loaded       = ref(false);
  const error        = ref(null);

  const activeAssociation = computed(() => associations.value.find(a => a.active) ?? null);
  const activeGymId       = computed(() => activeAssociation.value?.gymId ?? null);
  const hasNoActiveGym    = computed(() => loaded.value && !activeAssociation.value);

  async function loadAssociations() {
    loading.value = true; error.value = null;
    try {
      associations.value = await api.getMyGymAssociations();
      loaded.value = true;
    } catch (e) {
      error.value = e.message || 'Failed to load gym associations';
    } finally { loading.value = false; }
  }

  async function associateGym(gymId) {
    loading.value = true; error.value = null;
    try {
      await api.associateGym(gymId);
      await loadAssociations();
    } catch (e) {
      error.value = e.message || 'Failed to join gym';
      throw e;
    } finally { loading.value = false; }
  }

  async function changeActiveGym(gymId) {
    loading.value = true; error.value = null;
    try {
      await api.changeActiveGym(gymId);
      await loadAssociations();
    } catch (e) {
      error.value = e.message || 'Failed to change active gym';
      throw e;
    } finally { loading.value = false; }
  }

  return {
    associations, loading, loaded, error,
    activeAssociation, activeGymId, hasNoActiveGym,
    loadAssociations, associateGym, changeActiveGym,
  };
});
