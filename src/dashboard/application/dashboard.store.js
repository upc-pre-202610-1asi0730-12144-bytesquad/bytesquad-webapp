import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DashboardApi } from '../infrastructure/dashboard-api.js';
import { useEquipmentStore } from '@/equipment/application/equipment.store.js';
import { useMaintenanceStore } from '@/maintenance/application/maintenance.store.js';

const api = new DashboardApi();

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
  const hourlyCapacityData = computed(() => {
    const stats = usageStats.value;
    if (!stats.length) return [];
    const totalDaily = stats.reduce((s, r) => s + r.usageCountDaily, 0);
    const scale = Math.min(totalDaily / 30, 1);
    return [
      { hour: '06:00', occupancy: Math.round(30  * scale) },
      { hour: '08:00', occupancy: Math.round(78  * scale) },
      { hour: '10:00', occupancy: Math.round(65  * scale) },
      { hour: '12:00', occupancy: Math.round(40  * scale) },
      { hour: '14:00', occupancy: Math.round(50  * scale) },
      { hour: '16:00', occupancy: Math.round(72  * scale) },
      { hour: '18:00', occupancy: Math.round(85  * scale) },
      { hour: '19:00', occupancy: Math.round(95  * scale) },
      { hour: '20:00', occupancy: Math.round(88  * scale) },
      { hour: '21:00', occupancy: Math.round(60  * scale) },
    ];
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
        const roi = s.totalUsageHours < 30 ? 'Bajo' : s.totalUsageHours < 70 ? 'Medio' : 'Alto';
        return { machineId: `EQ-${s.equipmentId}`, location: eq ? `Zona ${eq.zoneId}` : '—', hours: Math.round(s.totalUsageHours), roi };
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
      usageStats.value = stats;
      sessions.value   = sess;
    } catch (e) {
      error.value = e.message || 'Failed to load dashboard';
    } finally { loading.value = false; }
  }

  load();

  return { usageStats, sessions, loading, error, SVG_W, SVG_H, operationalCount, maintenanceCount, outOfOrderCount, totalTickets, pendingTickets, inProgressTickets, resolvedTickets, hourlyCapacityData, linePoints, polylinePoints, areaPath, machineUsageBars, maxBarHours, underutilizedEquipment, ticketLabel, equipmentName };
});
