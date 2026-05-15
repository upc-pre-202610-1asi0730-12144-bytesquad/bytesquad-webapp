import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { FinancialApi } from '../infrastructure/financial-api.js';

const api = new FinancialApi();

const INACTIVITY_LOSS = [
  { month: 'Ene', loss: 3200 }, { month: 'Feb', loss: 2800 }, { month: 'Mar', loss: 4100 },
  { month: 'Abr', loss: 3600 }, { month: 'May', loss: 5200 }, { month: 'Jun', loss: 4700 },
];
const MAINTENANCE_TYPES = [
  { label: 'Preventivo', pct: 45, color: '#22c55e' },
  { label: 'Correctivo', pct: 35, color: '#ef4444' },
  { label: 'Lubricación', pct: 20, color: '#f5bc36' },
];
const ROI_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const useFinancialImpactStore = defineStore('financialImpact', () => {
  const usageStats  = ref([]);
  const equipments  = ref([]);
  const loading     = ref(false);
  const error       = ref(null);

  const simMachineCost    = ref(8000);
  const simUnmetDemand    = ref(15);
  const simRevenuePerUser = ref(89);

  const stats = computed(() => {
    const s = usageStats.value;
    if (!s.length) return { totalHours: 0, hoursChange: 0, occupancy: 0, occupancyChange: 0, peak: 0, peakTime: '—', inactive: 0, inactiveChange: 0 };
    const totalHours    = Math.round(s.reduce((a, r) => a + r.totalUsageHours, 0));
    const avgWear       = s.reduce((a, r) => a + r.estimatedWearLevel, 0) / s.length;
    const occupancy     = Math.round((1 - avgWear) * 100);
    const inactiveCount = s.filter(r => r.estimatedWearLevel >= 0.7).length;
    const inactive      = Math.round(inactiveCount * 24);
    const peakStat      = s.reduce((a, b) => a.usageCountDaily > b.usageCountDaily ? a : b, s[0]);
    const peak          = Math.min(100, Math.round((peakStat.usageCountDaily / 10) * 100));
    return { totalHours, hoursChange: 12, occupancy, occupancyChange: 5, peak, peakTime: '19:00 - 20:00', inactive, inactiveChange: -8 };
  });

  const roiProjectionData = computed(() => {
    const monthlyRevenue = simUnmetDemand.value * simRevenuePerUser.value;
    const yearlyPayback  = simMachineCost.value / 12;
    return ROI_MONTHS.map((m, i) => {
      const cumulative = (i + 1) * monthlyRevenue - yearlyPayback * (i + 1);
      return { month: m, value: Math.round(cumulative) };
    });
  });

  function maintenancePieGradient() {
    let cur = 0;
    return MAINTENANCE_TYPES.map(t => { const s = cur; cur += t.pct; return `${t.color} ${s}% ${cur}%`; }).join(', ');
  }

  const inactivityLoss = INACTIVITY_LOSS;
  const maintenanceTypes = MAINTENANCE_TYPES;

  async function load() {
    loading.value = true; error.value = null;
    try {
      const [s, eq] = await Promise.all([api.getUsageStats(), api.getEquipments()]);
      usageStats.value = s; equipments.value = eq;
    } catch (e) { error.value = e.message || 'Error loading financial data'; }
    finally { loading.value = false; }
  }

  load();

  return { loading, error, stats, simMachineCost, simUnmetDemand, simRevenuePerUser, roiProjectionData, maintenancePieGradient, inactivityLoss, maintenanceTypes };
});
