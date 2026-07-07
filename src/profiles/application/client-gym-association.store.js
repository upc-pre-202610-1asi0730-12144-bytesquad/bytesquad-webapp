import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ClientGymAssociationApi } from '../infrastructure/client-gym-association-api.js';

const api = new ClientGymAssociationApi();

export const useClientGymAssociationStore = defineStore('clientGymAssociation', () => {
  const associations        = ref([]);
  const availableGyms       = ref([]);
  const associationsChecked = ref(false);
  const loading             = ref(false);
  const gymsLoading         = ref(false);
  const error               = ref(null);

  const hasActiveGym = computed(() => associations.value.length > 0);

  async function loadMyAssociations() {
    try {
      associations.value = await api.getMyAssociations();
    } catch {
      associations.value = [];
    } finally {
      associationsChecked.value = true;
    }
  }

  async function loadAvailableGyms() {
    gymsLoading.value = true; error.value = null;
    try {
      availableGyms.value = await api.getAvailableGyms();
    } catch (e) {
      error.value = e.message || 'Failed to load gyms';
    } finally { gymsLoading.value = false; }
  }

  async function associate(gymId) {
    loading.value = true; error.value = null;
    try {
      const created = await api.associate(gymId);
      associations.value = [...associations.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to associate with gym';
      throw e;
    } finally { loading.value = false; }
  }

  return {
    associations, availableGyms, associationsChecked,
    loading, gymsLoading, error,
    hasActiveGym,
    loadMyAssociations, loadAvailableGyms, associate,
  };
});
