import { defineStore } from 'pinia';
import { ref } from 'vue';
import { GymApi } from '../infrastructure/gym-api.js';
import { Gym } from '../domain/model/gym.entity.js';
import { Branch } from '../domain/model/branch.entity.js';
import { Zone } from '../domain/model/zone.entity.js';

const api = new GymApi();

export const useGymStore = defineStore('gym', () => {
  const currentGym = ref(null);  // null = no gym | Gym entity = has gym
  const gymChecked = ref(false); // true after first getByAdmin call this session
  const gyms           = ref([]);
  const branches       = ref([]);
  const zones          = ref([]);
  const zonesMap       = ref({});  // { [branchId]: Zone[] }
  const zonesLoadingMap = ref({}); // { [branchId]: boolean }
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

  async function loadZones(gymId) {
    loading.value = true; error.value = null;
    try {
      zones.value = await api.getZonesByGymId(gymId);
    } catch (e) {
      error.value = e.message || 'Failed to load zones';
    } finally { loading.value = false; }
  }

  async function loadAdminGym(adminId) {
    try {
      currentGym.value = await api.getByAdmin(adminId);
    } catch {
      currentGym.value = null; // 404 = no gym yet, not a UI error
    } finally {
      gymChecked.value = true;
    }
  }

  async function addGym(data) {
    loading.value = true; error.value = null;
    try {
      const entity  = new Gym(data);
      const created = await api.createGym(entity);
      currentGym.value = created;
      gymChecked.value = true;
      gyms.value = [...gyms.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create gym';
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

  async function loadZonesForBranch(gymId, branchId) {
    zonesLoadingMap.value[branchId] = true;
    try {
      zonesMap.value[branchId] = await api.getZones(gymId, branchId);
    } catch (e) {
      console.error(`[gym] loadZonesForBranch(gymId=${gymId}, branchId=${branchId}) failed:`, e);
      zonesMap.value[branchId] = [];
    } finally {
      zonesLoadingMap.value[branchId] = false;
    }
  }

  async function addZone(gymId, branchId, data) {
    loading.value = true; error.value = null;
    try {
      const entity  = new Zone(data);
      const created = await api.createZone(gymId, branchId, entity);
      zones.value = [...zones.value, created];
      if (zonesMap.value[branchId] !== undefined) {
        zonesMap.value[branchId] = [...zonesMap.value[branchId], created];
      }
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create zone';
    } finally { loading.value = false; }
  }

  return {
    currentGym, gymChecked, gyms, branches, zones, zonesMap, zonesLoadingMap, loading, error,
    loadGyms, loadBranches, loadZones, loadZonesForBranch, loadAdminGym, addGym, addBranch, addZone,
  };
});
