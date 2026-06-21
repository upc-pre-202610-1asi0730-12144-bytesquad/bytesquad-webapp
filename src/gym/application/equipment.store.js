import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { EquipmentApi } from '../infrastructure/equipment-api.js';
import { Equipment, EquipmentStatus } from '../domain/model/equipment.entity.js';

const api = new EquipmentApi();

const FAKE_EQUIPMENT = [
  { id: 1,  zoneId: 'A', name: 'Excavator CAT 320',   brand: 'Caterpillar', model: 'CAT 320',    purchasePrice: 185000, status: EquipmentStatus.OPERATIONAL },
  { id: 2,  zoneId: 'A', name: 'Bulldozer D6T',        brand: 'Caterpillar', model: 'D6T',        purchasePrice: 210000, status: EquipmentStatus.OPERATIONAL },
  { id: 3,  zoneId: 'B', name: 'Wheel Loader 950M',    brand: 'Caterpillar', model: '950M',       purchasePrice: 155000, status: EquipmentStatus.MAINTENANCE },
  { id: 4,  zoneId: 'B', name: 'Komatsu PC300',        brand: 'Komatsu',     model: 'PC300-8',    purchasePrice: 175000, status: EquipmentStatus.OPERATIONAL },
  { id: 5,  zoneId: 'B', name: 'Komatsu D155',         brand: 'Komatsu',     model: 'D155AX-8',   purchasePrice: 230000, status: EquipmentStatus.OPERATIONAL },
  { id: 6,  zoneId: 'C', name: 'Volvo EC480',          brand: 'Volvo',       model: 'EC480E',     purchasePrice: 195000, status: EquipmentStatus.OPERATIONAL },
  { id: 7,  zoneId: 'C', name: 'Volvo L120H',          brand: 'Volvo',       model: 'L120H',      purchasePrice: 140000, status: EquipmentStatus.OUT_OF_ORDER },
  { id: 8,  zoneId: 'C', name: 'Liebherr LTM 1100',   brand: 'Liebherr',    model: 'LTM 1100-4', purchasePrice: 320000, status: EquipmentStatus.OPERATIONAL },
  { id: 9,  zoneId: 'D', name: 'Skid Steer 262D3',    brand: 'Caterpillar', model: '262D3',      purchasePrice:  68000, status: EquipmentStatus.OPERATIONAL },
  { id: 10, zoneId: 'D', name: 'Mini Excavator 305E2', brand: 'Caterpillar', model: '305E2',      purchasePrice:  52000, status: EquipmentStatus.OPERATIONAL },
  { id: 11, zoneId: 'D', name: 'Compactor CS56B',      brand: 'Caterpillar', model: 'CS56B',      purchasePrice:  89000, status: EquipmentStatus.MAINTENANCE },
  { id: 12, zoneId: 'A', name: 'Motor Grader 140M3',   brand: 'Caterpillar', model: '140M3',      purchasePrice: 165000, status: EquipmentStatus.OPERATIONAL },
  { id: 13, zoneId: 'A', name: 'Backhoe 420F2',        brand: 'Caterpillar', model: '420F2',      purchasePrice:  78000, status: EquipmentStatus.OPERATIONAL },
  { id: 14, zoneId: 'B', name: 'Komatsu WA380',        brand: 'Komatsu',     model: 'WA380-8',   purchasePrice: 148000, status: EquipmentStatus.OPERATIONAL },
  { id: 15, zoneId: 'C', name: 'Telehandler TH337D',   brand: 'Caterpillar', model: 'TH337D',     purchasePrice:  95000, status: EquipmentStatus.OPERATIONAL },
  { id: 16, zoneId: 'D', name: 'Articulated Truck 745', brand: 'Caterpillar', model: '745',       purchasePrice: 278000, status: EquipmentStatus.MAINTENANCE },
  { id: 17, zoneId: 'D', name: 'Pipelayer PL72',       brand: 'Caterpillar', model: 'PL72',       purchasePrice: 192000, status: EquipmentStatus.OUT_OF_ORDER },
].map(d => new Equipment(d));

export const useEquipmentStore = defineStore('equipment', () => {
  const equipment = ref([]);
  const loading   = ref(false);
  const error     = ref(null);

  const equipmentCount   = computed(() => equipment.value.length);
  const operationalCount = computed(() => equipment.value.filter(e => e.status === EquipmentStatus.OPERATIONAL).length);
  const maintenanceCount = computed(() => equipment.value.filter(e => e.status === EquipmentStatus.MAINTENANCE).length);
  const outOfOrderCount  = computed(() => equipment.value.filter(e => e.status === EquipmentStatus.OUT_OF_ORDER).length);

  async function loadEquipment() {
    loading.value = true; error.value = null;
    try {
      const result = await api.getEquipment();
      equipment.value = result.length ? result : FAKE_EQUIPMENT;
    } catch {
      equipment.value = FAKE_EQUIPMENT;
    } finally {
      loading.value = false;
    }
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

  function getById(id) {
    return computed(() => equipment.value.find(e => e.id === id));
  }

  loadEquipment();

  return { equipment, loading, error, equipmentCount, operationalCount, maintenanceCount, outOfOrderCount, loadEquipment, addEquipment, updateEquipment, deleteEquipment, getById };
});
