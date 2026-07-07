import { defineStore } from 'pinia';
import { ref } from 'vue';
import { GymApi } from '../infrastructure/gym-api.js';
import { Gym } from '../domain/model/gym.entity.js';
import { Branch } from '../domain/model/branch.entity.js';
import { Zone } from '../domain/model/zone.entity.js';

const api = new GymApi();

export const useGymStore = defineStore('gym', () => {
  // TODO: wire when backend adds GET /gyms
  const gyms     = ref([]);
  const branches = ref([]);
  const zones    = ref([]);
  const loading  = ref(false);
  const error    = ref(null);

  async function addGym(data) {
    loading.value = true; error.value = null;
    try {
      const entity  = new Gym(data);
      const created = await api.createGym(entity);
      gyms.value = [...gyms.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create gym';
    } finally { loading.value = false; }
  }

  async function addBranch(gymId, data) {
    loading.value = true; error.value = null;
    try {
      const entity  = new Branch(data);
      const created = await api.createBranch(gymId, entity);
      branches.value = [...branches.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Branch could not be created. Check your plan branch limit.';
    } finally { loading.value = false; }
  }

  async function addZone(gymId, branchId, data) {
    loading.value = true; error.value = null;
    try {
      const entity  = new Zone(data);
      const created = await api.createZone(gymId, branchId, entity);
      zones.value = [...zones.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create zone';
    } finally { loading.value = false; }
  }

  return { gyms, branches, zones, loading, error, addGym, addBranch, addZone };
});
