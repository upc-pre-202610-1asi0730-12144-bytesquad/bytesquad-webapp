import { defineStore } from 'pinia';
import { ref } from 'vue';
import { BranchAccessApi } from '../infrastructure/branch-access-api.js';

const api = new BranchAccessApi();

export const useBranchAccessStore = defineStore('branchAccess', () => {
  // TODO: wire when backend adds GET /branch-accesses
  const accesses = ref([]);
  const loading  = ref(false);
  const error    = ref(null);

  async function grant(membershipId, branchId, grantedByAdminId) {
    loading.value = true; error.value = null;
    try {
      const created = await api.grant(membershipId, branchId, grantedByAdminId);
      accesses.value = [...accesses.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to grant branch access';
    } finally { loading.value = false; }
  }

  return { accesses, loading, error, grant };
});
