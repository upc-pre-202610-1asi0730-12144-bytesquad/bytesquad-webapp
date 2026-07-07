import { defineStore } from 'pinia';
import { ref } from 'vue';
import { RoiProjectionApi } from '../infrastructure/roi-projection-api.js';

const api = new RoiProjectionApi();

export const useRoiProjectionStore = defineStore('roiProjection', () => {
  const projections = ref([]);
  const loading     = ref(false);
  const error       = ref(null);

  function _upsert(projection) {
    const idx = projections.value.findIndex(p => p.roiProjectionId === projection.roiProjectionId);
    if (idx >= 0) projections.value = projections.value.map(p => p.roiProjectionId === projection.roiProjectionId ? projection : p);
    else projections.value = [projection, ...projections.value];
  }

  async function createProjection(projectedDowntimeCost) {
    loading.value = true; error.value = null;
    try {
      const created = await api.create(projectedDowntimeCost);
      _upsert(created);
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create ROI projection';
    } finally { loading.value = false; }
  }

  async function updateProjectedEarnings(roiProjectionId, projectedEarnings) {
    try {
      _upsert(await api.updateProjectedEarnings(roiProjectionId, projectedEarnings));
    } catch (e) { error.value = e.message; }
  }

  async function generate(roiProjectionId) {
    try {
      _upsert(await api.generate(roiProjectionId));
    } catch (e) { error.value = e.message; }
  }

  async function loadByAdmin(adminId) {
    loading.value = true; error.value = null;
    try {
      projections.value = await api.getByAdmin(adminId);
    } catch (e) {
      error.value = e.message || 'Failed to load ROI projections';
    } finally { loading.value = false; }
  }

  return { projections, loading, error, createProjection, updateProjectedEarnings, generate, loadByAdmin };
});
