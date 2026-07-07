import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { EquipmentApi } from '../infrastructure/equipment-api.js';
import { EquipmentStatus } from '../domain/model/equipment.entity.js';

const api = new EquipmentApi();

export const useEquipmentStore = defineStore('equipment', () => {
  const equipment = ref([]);
  const loading   = ref(false);
  const error     = ref(null);

  const equipmentCount   = computed(() => equipment.value.length);
  const operationalCount = computed(() => equipment.value.filter(e => e.status === EquipmentStatus.OPERATIONAL || e.status === EquipmentStatus.AVAILABLE).length);
  const maintenanceCount = computed(() => equipment.value.filter(e => e.status === EquipmentStatus.MAINTENANCE).length);
  const outOfOrderCount  = computed(() => equipment.value.filter(e => e.status === EquipmentStatus.OUT_OF_ORDER).length);

  async function loadEquipment(adminId) {
    loading.value = true; error.value = null;
    try {
      equipment.value = await api.getByAdmin(adminId);
    } catch (e) {
      error.value = e.message || 'Failed to load equipment';
    } finally { loading.value = false; }
  }

  async function addEquipment(entity) {
    loading.value = true; error.value = null;
    try {
      const created = await api.registerEquipment(entity);
      equipment.value = [...equipment.value, created];
    } catch (e) {
      error.value = e.message || 'Failed to add equipment';
    } finally { loading.value = false; }
  }

  async function updateEquipment(entity) {
    loading.value = true; error.value = null;
    try {
      const updated = await api.updateEquipment(entity);
      equipment.value = equipment.value.map(e => e.id === updated.id ? updated : e);
    } catch (e) {
      error.value = e.message || 'Failed to update equipment';
    } finally { loading.value = false; }
  }

  async function deleteEquipment(id) {
    loading.value = true; error.value = null;
    try {
      await api.deleteEquipment(id);
      equipment.value = equipment.value.filter(e => e.id !== id);
    } catch (e) {
      error.value = e.message || 'Failed to delete equipment';
    } finally { loading.value = false; }
  }

  async function decommissionEquipment(id) {
    loading.value = true; error.value = null;
    try {
      await api.decommissionEquipment(id);
      equipment.value = equipment.value.map(e =>
        e.id === id ? { ...e, status: EquipmentStatus.DECOMMISSIONED } : e
      );
    } catch (e) {
      error.value = e.message || 'Failed to decommission equipment';
    } finally { loading.value = false; }
  }

  function getById(id) {
    return computed(() => equipment.value.find(e => e.id === id));
  }

  return { equipment, loading, error, equipmentCount, operationalCount, maintenanceCount, outOfOrderCount, loadEquipment, addEquipment, updateEquipment, deleteEquipment, decommissionEquipment, getById };
});
