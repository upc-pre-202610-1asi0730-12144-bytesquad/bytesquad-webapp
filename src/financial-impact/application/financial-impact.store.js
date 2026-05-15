import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { FinancialApi } from '../infrastructure/financial-api.js';

const api = new FinancialApi();

const INACTIVITY_MACHINES = [
  { machine: 'Cinta #3',        hours: 46, ratePerHour: 12, total: 552  },
  { machine: 'Elíptica Pro',    hours: 72, ratePerHour: 8,  total: 576  },
  { machine: 'Rack Sentadilla', hours: 24, ratePerHour: 15, total: 360  },
  { machine: 'Prensa Piernas',  hours: 36, ratePerHour: 10, total: 360  },
];

const MAINTENANCE_BREAKDOWN = [
  { labelKey: 'corrective', color: '#ef4444', pct: 62, amount: 3200 },
  { labelKey: 'preventive', color: '#22c55e', pct: 21, amount: 1100 },
  { labelKey: 'inventory',  color: '#f5bc36', pct: 17, amount:  850 },
];

const ROI_SCALE = 6000;

export const useFinancialImpactStore = defineStore('financialImpact', () => {
  const loading = ref(false);
  const error   = ref(null);

  const simMachineCost    = ref(5000);
  const simUnmetDemand    = ref(120);
  const simRevenuePerUser = ref(45);

  // KPI summary values (static / derived from machine data)
  const totalInactivityLoss = computed(() => INACTIVITY_MACHINES.reduce((s, m) => s + m.total, 0));
  const totalMaintenanceCost = computed(() => MAINTENANCE_BREAKDOWN.reduce((s, b) => s + b.amount, 0));

  // ROI projection: invest at month 0, earn monthlyRevenue each month
  // value(i) = i * monthly - cost   →  Mes 1 negative, breakeven around month cost/monthly
  const roiProjectionData = computed(() => {
    const monthly = simUnmetDemand.value * simRevenuePerUser.value;
    const cost    = simMachineCost.value;
    return Array.from({ length: 8 }, (_, i) => ({
      month: `Mes ${i + 1}`,
      value: Math.round(i * monthly - cost),
    }));
  });

  // ROI result for the "Calculate" button
  const simResult = computed(() => {
    const monthly  = simUnmetDemand.value * simRevenuePerUser.value;
    const cost     = simMachineCost.value;
    if (monthly <= 0) return null;
    const paybackMonths = cost / monthly;
    const annualReturn  = monthly * 12;
    const netAnnual     = annualReturn - cost;
    return { paybackMonths: paybackMonths.toFixed(1), annualReturn, netAnnual };
  });

  function maintenancePieGradient() {
    let cur = 0;
    return MAINTENANCE_BREAKDOWN.map(b => {
      const s = cur; cur += b.pct; return `${b.color} ${s}% ${cur}%`;
    }).join(', ');
  }

  function roiBarPos(value) {
    const clamped = Math.max(-ROI_SCALE, Math.min(ROI_SCALE, value));
    const zeroY   = 120; // center of 240px chart height
    if (clamped >= 0) {
      const h = (clamped / ROI_SCALE) * 120;
      return { y: zeroY - h, height: h };
    } else {
      const h = (Math.abs(clamped) / ROI_SCALE) * 120;
      return { y: zeroY, height: h };
    }
  }

  async function load() {
    loading.value = true; error.value = null;
    try { await Promise.all([api.getUsageStats(), api.getEquipments()]); }
    catch (e) { error.value = e.message || 'Error loading financial data'; }
    finally { loading.value = false; }
  }

  load();

  return {
    loading, error,
    simMachineCost, simUnmetDemand, simRevenuePerUser,
    totalInactivityLoss, totalMaintenanceCost,
    roiProjectionData, simResult,
    inactivityMachines: INACTIVITY_MACHINES,
    maintenanceBreakdown: MAINTENANCE_BREAKDOWN,
    maintenancePieGradient, roiBarPos,
    ROI_SCALE,
  };
});
