import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AnalyticsApi } from '../infrastructure/analytics-api.js';

const api = new AnalyticsApi();
const SVG_W = 1160, SVG_H = 200;

export const useAnalyticsStore = defineStore('analytics', () => {
  const usageStats  = ref([]);
  const equipments  = ref([]);
  const loading     = ref(false);
  const error       = ref(null);
  const selectedBranch = ref('all');

  const stats = computed(() => {
    const s = usageStats.value;
    if (!s.length) return { totalHours: 0, hoursChange: 0, occupancy: 0, occupancyChange: 0, peak: 0, peakTime: '—', inactive: 0, inactiveChange: 0 };
    const totalHours    = Math.round(s.reduce((acc, r) => acc + r.totalUsageHours, 0));
    const avgWear       = s.reduce((acc, r) => acc + r.estimatedWearLevel, 0) / s.length;
    const occupancy     = Math.round((1 - avgWear) * 100);
    const inactiveCount = s.filter(r => r.estimatedWearLevel >= 0.7).length;
    const inactive      = Math.round(inactiveCount * 24);
    const peakStat      = s.reduce((a, b) => a.usageCountDaily > b.usageCountDaily ? a : b, s[0]);
    const peak          = Math.min(100, Math.round((peakStat.usageCountDaily / 10) * 100));
    return { totalHours, hoursChange: 12, occupancy, occupancyChange: 5, peak, peakTime: '19:00 - 20:00', inactive, inactiveChange: -8 };
  });

  const weeklyData = computed(() => {
    const s = usageStats.value;
    if (!s.length) return [];
    const totalDaily = s.reduce((acc, r) => acc + r.usageCountDaily, 0);
    const days    = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const weights = [0.85, 1.00, 0.90, 1.10, 1.25, 1.15, 0.70];
    const wSum    = weights.reduce((a, b) => a + b, 0);
    return days.map((day, i) => {
      const usage     = Math.round((weights[i] / wSum) * totalDaily * 7);
      const prevUsage = Math.round(usage * 0.88);
      return { day, usage, prevUsage };
    });
  });

  const maxCapacity = computed(() => Math.max(...weeklyData.value.map(b => b.usage), 600));

  const hourlyData = computed(() => {
    const s = usageStats.value;
    if (!s.length) return [];
    const totalDaily = s.reduce((acc, r) => acc + r.usageCountDaily, 0);
    const scale = Math.min(totalDaily / 30, 1);
    return [
      { hour: '06:00', occupancy: Math.round(30  * scale) },
      { hour: '07:00', occupancy: Math.round(55  * scale) },
      { hour: '08:00', occupancy: Math.round(78  * scale) },
      { hour: '09:00', occupancy: Math.round(88  * scale) },
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

  const machineTypes = computed(() => {
    const eq = equipments.value;
    if (!eq.length) return [{ label: 'Cardio', pct: 45, color: '#f5bc36' }, { label: 'Fuerza', pct: 35, color: '#00ccb2' }, { label: 'Funcional', pct: 20, color: '#22c55e' }];
    const total    = eq.length || 1;
    const cardio   = eq.filter(e => e.zone_id === 1).length;
    const fuerza   = eq.filter(e => e.zone_id === 2).length;
    const funcional= eq.filter(e => e.zone_id !== 1 && e.zone_id !== 2).length;
    return [{ label: 'Cardio', pct: Math.round((cardio / total) * 100), color: '#f5bc36' }, { label: 'Fuerza', pct: Math.round((fuerza / total) * 100), color: '#00ccb2' }, { label: 'Funcional', pct: Math.round((funcional / total) * 100), color: '#22c55e' }];
  });

  function pieGradient() {
    let cur = 0;
    return machineTypes.value.map(t => { const s = cur; cur += t.pct; return `${t.color} ${s}% ${cur}%`; }).join(', ');
  }

  const relocationData = computed(() => {
    const s = usageStats.value, eq = equipments.value;
    if (!s.length || !eq.length) return [];
    const BRANCHES = ['Sede Miraflores', 'Sede San Isidro', 'Sede Surco', 'Sede Barranco'];
    return s.filter(stat => stat.totalUsageHours < 100 && eq.find(e => e.id === stat.equipmentId)?.status === 'OPERATIONAL')
      .map((stat, i) => {
        const e = eq.find(x => x.id === stat.equipmentId);
        const fromOcc = Math.round(stat.totalUsageHours / 2);
        const toOcc   = Math.min(99, fromOcc + 40 + Math.round(Math.random() * 30));
        const savings = Math.round((toOcc - fromOcc) * 12);
        const priority = fromOcc < 30 ? 'HIGH' : fromOcc < 50 ? 'MEDIUM' : 'LOW';
        return { machine: e?.name ?? `EQ-${stat.equipmentId}`, fromBranch: BRANCHES[i % 4], fromOccupancy: fromOcc, toBranch: BRANCHES[(i + 2) % 4], toOccupancy: toOcc, savingsPerMonth: savings, priority };
      });
  });

  const linePoints = computed(() =>
    hourlyData.value.map((d, i) => ({ x: (i / Math.max(hourlyData.value.length - 1, 1)) * SVG_W, y: SVG_H - (d.occupancy / 100) * SVG_H, ...d }))
  );
  const polylinePoints = computed(() => linePoints.value.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
  const areaPath = computed(() => {
    const pts = linePoints.value;
    if (!pts.length) return '';
    return `M${pts[0].x},${SVG_H} ${pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} L${pts[pts.length - 1].x},${SVG_H} Z`;
  });
  const threshold90Y = SVG_H - 0.9 * SVG_H;

  async function load() {
    loading.value = true; error.value = null;
    try {
      const [s, eq] = await Promise.all([api.getUsageStats(), api.getEquipments()]);
      usageStats.value = s; equipments.value = eq;
    } catch (e) { error.value = e.message || 'Error loading analytics'; }
    finally { loading.value = false; }
  }

  load();

  return { loading, error, selectedBranch, stats, weeklyData, maxCapacity, hourlyData, machineTypes, pieGradient, relocationData, linePoints, polylinePoints, areaPath, threshold90Y, SVG_W, SVG_H };
});
