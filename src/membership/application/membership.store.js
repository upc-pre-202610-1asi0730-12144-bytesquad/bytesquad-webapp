import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MembershipApi } from '../infrastructure/membership-api.js';

const api = new MembershipApi();

export const useMembershipStore = defineStore('membership', () => {
  const memberships        = ref([]);
  const currentMembership  = ref(null);
  const loading            = ref(false);
  const error              = ref(null);

  function _upsert(updated) {
    const idx = memberships.value.findIndex(m => m.id === updated.id);
    if (idx >= 0) memberships.value = memberships.value.map(m => m.id === updated.id ? updated : m);
    else memberships.value = [...memberships.value, updated];
  }

  async function activate(clientId, plan, startDate, endDate) {
    loading.value = true; error.value = null;
    try {
      const created = await api.activate(clientId, plan, startDate, endDate);
      _upsert(created);
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to activate membership';
    } finally { loading.value = false; }
  }

  async function loadById(id) {
    loading.value = true; error.value = null;
    try {
      const found = await api.getById(id);
      currentMembership.value = found;
      _upsert(found);
      return found;
    } catch (e) {
      error.value = e.message || 'Failed to load membership';
    } finally { loading.value = false; }
  }

  async function loadByClient(clientId) {
    loading.value = true; error.value = null;
    try {
      const list = await api.getByClient(clientId);
      memberships.value = list;
      return list;
    } catch (e) {
      error.value = e.message || 'Failed to load memberships';
    } finally { loading.value = false; }
  }

  async function changePlan(id, newPlan) {
    loading.value = true; error.value = null;
    try {
      const updated = await api.updatePlan(id, newPlan);
      _upsert(updated);
      return updated;
    } catch (e) {
      error.value = e.message || 'Failed to update plan';
    } finally { loading.value = false; }
  }

  async function suspend(id) {
    loading.value = true; error.value = null;
    try {
      const updated = await api.suspend(id);
      _upsert(updated);
      return updated;
    } catch (e) {
      error.value = e.message || 'Failed to suspend membership';
    } finally { loading.value = false; }
  }

  async function renew(id, newEndDate) {
    loading.value = true; error.value = null;
    try {
      const updated = await api.renew(id, newEndDate);
      _upsert(updated);
      return updated;
    } catch (e) {
      error.value = e.message || 'Failed to renew membership';
    } finally { loading.value = false; }
  }

  async function cancel(id) {
    loading.value = true; error.value = null;
    try {
      const updated = await api.cancel(id);
      _upsert(updated);
      return updated;
    } catch (e) {
      error.value = e.message || 'Failed to cancel membership';
    } finally { loading.value = false; }
  }

  async function downgrade(id, newPlan) {
    loading.value = true; error.value = null;
    try {
      const updated = await api.downgrade(id, newPlan);
      _upsert(updated);
      return updated;
    } catch (e) {
      error.value = e.message || 'Failed to downgrade plan';
    } finally { loading.value = false; }
  }

  return { memberships, currentMembership, loading, error, activate, loadById, loadByClient, changePlan, downgrade, suspend, renew, cancel };
});
