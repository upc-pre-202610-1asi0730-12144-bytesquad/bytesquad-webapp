import { defineStore } from 'pinia';
import { ref } from 'vue';
import { GymApi } from '../infrastructure/gym-api.js';
import { Gym } from '../domain/model/gym.entity.js';
import { Branch } from '../domain/model/branch.entity.js';
import { Zone } from '../domain/model/zone.entity.js';

const api = new GymApi();

export const useGymStore = defineStore('gym', () => {
  const gyms     = ref([]);
  const branches = ref([]);
  const zones    = ref([]);
  const loading  = ref(false);
  const error    = ref(null);

  async function loadGyms() {
    loading.value = true; error.value = null;
    try {
      gyms.value = await api.getAllGyms();
    } catch (e) {
      error.value = e.message || 'Failed to load gyms';
    } finally { loading.value = false; }
  }

  async function loadBranches(gymId) {
    loading.value = true; error.value = null;
    try {
      branches.value = await api.getBranchesByGymId(gymId);
    } catch (e) {
      error.value = e.message || 'Failed to load branches';
    } finally { loading.value = false; }
  }

  async function loadZones(gymId) {
    loading.value = true; error.value = null;
    try {
      zones.value = await api.getZonesByGymId(gymId);
    } catch (e) {
      error.value = e.message || 'Failed to load zones';
    } finally { loading.value = false; }
  }

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
      error.value = e.message || 'Failed to create branch';
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

  return {
    gyms, branches, zones, loading, error,
    loadGyms, loadBranches, loadZones, addGym, addBranch, addZone,
  };
});
