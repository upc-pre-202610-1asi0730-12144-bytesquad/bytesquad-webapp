import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DashboardApi } from '../infrastructure/dashboard-api.js';
import { EquipmentUsageStat } from '../domain/model/equipment-usage-stat.entity.js';
import { useEquipmentStore } from '@/gym/application/equipment.store.js';
import { useMaintenanceStore } from '@/maintenance/application/maintenance.store.js';

const api = new DashboardApi();

const FAKE_USAGE_STATS = [
  { id: 1,  equipmentId: 1,  totalUsageHours: 842,  usageCountDaily: 12, estimatedWearLevel: 0.68 },
  { id: 2,  equipmentId: 2,  totalUsageHours: 765,  usageCountDaily: 11, estimatedWearLevel: 0.60 },
  { id: 3,  equipmentId: 3,  totalUsageHours:  58,  usageCountDaily:  3, estimatedWearLevel: 0.22 },
  { id: 4,  equipmentId: 4,  totalUsageHours: 634,  usageCountDaily: 10, estimatedWearLevel: 0.52 },
  { id: 5,  equipmentId: 5,  totalUsageHours: 910,  usageCountDaily: 14, estimatedWearLevel: 0.74 },
  { id: 6,  equipmentId: 6,  totalUsageHours: 520,  usageCountDaily:  9, estimatedWearLevel: 0.43 },
  { id: 7,  equipmentId: 7,  totalUsageHours:  42,  usageCountDaily:  2, estimatedWearLevel: 0.18 },
  { id: 8,  equipmentId: 8,  totalUsageHours: 310,  usageCountDaily:  6, estimatedWearLevel: 0.28 },
  { id: 9,  equipmentId: 9,  totalUsageHours: 487,  usageCountDaily:  8, estimatedWearLevel: 0.40 },
  { id: 10, equipmentId: 10, totalUsageHours:  73,  usageCountDaily:  4, estimatedWearLevel: 0.25 },
  { id: 11, equipmentId: 11, totalUsageHours:  88,  usageCountDaily:  5, estimatedWearLevel: 0.30 },
  { id: 12, equipmentId: 12, totalUsageHours: 695,  usageCountDaily: 11, estimatedWearLevel: 0.55 },
  { id: 13, equipmentId: 13, totalUsageHours: 412,  usageCountDaily:  7, estimatedWearLevel: 0.35 },
  { id: 14, equipmentId: 14, totalUsageHours: 558,  usageCountDaily:  9, estimatedWearLevel: 0.46 },
  { id: 15, equipmentId: 15, totalUsageHours: 230,  usageCountDaily:  5, estimatedWearLevel: 0.20 },
  { id: 16, equipmentId: 16, totalUsageHours:  65,  usageCountDaily:  3, estimatedWearLevel: 0.24 },
  { id: 17, equipmentId: 17, totalUsageHours:  31,  usageCountDaily:  1, estimatedWearLevel: 0.12 },
].map(d => new EquipmentUsageStat(d));

const SVG_W = 680;
const SVG_H = 160;

export const useDashboardStore = defineStore('dashboard', () => {
  const usageStats = ref([]);
  const sessions   = ref([]);
  const loading    = ref(false);
  const error      = ref(null);

  // ─── KPI derived from Equipment store ─────────────────────────────────────
  const operationalCount = computed(() => useEquipmentStore().operationalCount);
  const maintenanceCount = computed(() => useEquipmentStore().maintenanceCount);
  const outOfOrderCount  = computed(() => useEquipmentStore().outOfOrderCount);
  const totalTickets     = computed(() => useMaintenanceStore().totalTickets);
  const pendingTickets   = computed(() => useMaintenanceStore().pendingTickets);
  const inProgressTickets= computed(() => useMaintenanceStore().inProgressTickets);
  const resolvedTickets  = computed(() => useMaintenanceStore().resolvedTickets);

  // ─── Line chart: hourly capacity ──────────────────────────────────────────
  const PEAK_BASELINE = [
    { hour: '06:00', occupancy: 30  },
    { hour: '08:00', occupancy: 78  },
    { hour: '10:00', occupancy: 65  },
    { hour: '12:00', occupancy: 40  },
    { hour: '14:00', occupancy: 50  },
    { hour: '16:00', occupancy: 72  },
    { hour: '18:00', occupancy: 85  },
    { hour: '19:00', occupancy: 95  },
    { hour: '20:00', occupancy: 88  },
    { hour: '21:00', occupancy: 60  },
  ];

  const hourlyCapacityData = computed(() => {
    const stats = usageStats.value;
    if (!stats.length) return PEAK_BASELINE;
    const totalDaily = stats.reduce((s, r) => s + r.usageCountDaily, 0);
    const scale = Math.min(totalDaily / 30, 1);
    return PEAK_BASELINE.map(d => ({ hour: d.hour, occupancy: Math.round(d.occupancy * scale) }));
  });

  const linePoints = computed(() =>
    hourlyCapacityData.value.map((d, i) => ({
      x: (i / Math.max(hourlyCapacityData.value.length - 1, 1)) * SVG_W,
      y: SVG_H - (d.occupancy / 100) * SVG_H,
      ...d,
    }))
  );

  const polylinePoints = computed(() =>
    linePoints.value.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  );

  const areaPath = computed(() => {
    const pts = linePoints.value;
    if (!pts.length) return '';
    return `M${pts[0].x},${SVG_H} ${pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} L${pts[pts.length - 1].x},${SVG_H} Z`;
  });

  // ─── Bar chart: machine usage ─────────────────────────────────────────────
  const machineUsageBars = computed(() => {
    const equipStore = useEquipmentStore();
    return usageStats.value
      .sort((a, b) => b.totalUsageHours - a.totalUsageHours)
      .slice(0, 8)
      .map(stat => {
        const eq = equipStore.equipment.find(e => e.id === stat.equipmentId);
        return { name: eq?.name ?? `EQ-${stat.equipmentId}`, hours: Math.round(stat.totalUsageHours) };
      });
  });

  const maxBarHours = computed(() => Math.max(...machineUsageBars.value.map(b => b.hours), 1));

  // ─── Table: underutilized equipment ───────────────────────────────────────
  const underutilizedEquipment = computed(() => {
    const equipStore = useEquipmentStore();
    return usageStats.value
      .filter(s => s.totalUsageHours < 100)
      .map(s => {
        const eq = equipStore.equipment.find(e => e.id === s.equipmentId);
        const roi = s.totalUsageHours < 30 ? 'LOW' : s.totalUsageHours < 70 ? 'MEDIUM' : 'HIGH';
        return { machineId: `EQ-${s.equipmentId}`, zoneId: eq ? eq.zoneId : '—', hours: Math.round(s.totalUsageHours), roi };
      });
  });

  // ─── Helper ───────────────────────────────────────────────────────────────
  function ticketLabel(id) { return `#${String(id).slice(-4).padStart(4, '0')}`; }

  function equipmentName(equipmentId) {
    return useEquipmentStore().equipment.find(e => e.id === equipmentId)?.name ?? `EQ-${equipmentId}`;
  }

  async function load() {
    loading.value = true; error.value = null;
    try {
      const [stats, sess] = await Promise.all([api.getEquipmentUsageStats(), api.getUsageSessions()]);
      usageStats.value = stats.length ? stats : FAKE_USAGE_STATS;
      sessions.value   = sess;
    } catch {
      usageStats.value = FAKE_USAGE_STATS;
    } finally { loading.value = false; }
  }

  load();

  return { usageStats, sessions, loading, error, SVG_W, SVG_H, operationalCount, maintenanceCount, outOfOrderCount, totalTickets, pendingTickets, inProgressTickets, resolvedTickets, hourlyCapacityData, linePoints, polylinePoints, areaPath, machineUsageBars, maxBarHours, underutilizedEquipment, ticketLabel, equipmentName };
});
