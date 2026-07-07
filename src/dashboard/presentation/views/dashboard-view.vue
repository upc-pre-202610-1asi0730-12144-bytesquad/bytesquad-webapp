<script setup>
import { computed, onMounted } from 'vue';
import { useDashboardStore } from '@/dashboard/application/dashboard.store.js';

const store = useDashboardStore();
onMounted(() => store.load());

// ── Line chart (activity reports: totalUsageTime over time) ────────────
const SVG_W = 680;
const SVG_H = 220;

const chartReports = computed(() => [...store.activityReports].reverse());
const maxUsage     = computed(() => Math.max(...chartReports.value.map(r => r.totalUsageTime), 1));

const yTicks = computed(() =>
  [1, 0.75, 0.5, 0.25, 0].map(f => ({
    value: Math.round(maxUsage.value * f),
    y: SVG_H - f * SVG_H,
  }))
);

const chartPoints = computed(() => {
  const pts = chartReports.value;
  if (pts.length < 2) return [];
  return pts.map((r, i) => ({
    x: (i / (pts.length - 1)) * SVG_W,
    y: SVG_H - (r.totalUsageTime / maxUsage.value) * SVG_H,
    label: r.createdAt ? r.createdAt.slice(5, 10) : `#${i + 1}`,
  }));
});

const polylinePoints = computed(() =>
  chartPoints.value.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
);

const areaPath = computed(() => {
  const pts = chartPoints.value;
  if (!pts.length) return '';
  return `M${pts[0].x.toFixed(1)},${SVG_H} ${pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} L${pts[pts.length - 1].x.toFixed(1)},${SVG_H} Z`;
});

// ── Demand badges ──────────────────────────────────────────────────────
const DEMAND_CLASS = { HIGH_DEMAND: 'badge--red', UNDER_REVIEW: 'badge--amber', STABLE_DEMAND: 'badge--green' };
const DEMAND_LABEL = { HIGH_DEMAND: 'Alta demanda', UNDER_REVIEW: 'En revisión', STABLE_DEMAND: 'Estable' };

// ── Formatters ─────────────────────────────────────────────────────────
function fmt(n, dec = 0) {
  if (n == null) return '—';
  return Number(n).toLocaleString('es-PE', { maximumFractionDigits: dec });
}
function fmtDate(iso) { return iso ? iso.slice(0, 10) : '—'; }
</script>

<template>
  <div class="dash-page page">
    <div v-if="store.loading" class="dash-state">
      <span class="material-icons spin">sync</span>
    </div>

    <template v-else>
      <div v-if="store.error" class="error-banner">
        <span class="material-icons">error_outline</span>
        <span>{{ store.error }}</span>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-row">
        <div class="kpi-card card">
          <span class="material-icons kpi-icon kpi-icon--blue">timer</span>
          <div>
            <p class="kpi-label">Tiempo de uso total</p>
            <p class="kpi-value">{{ fmt(store.latestActivityReport?.totalUsageTime) }}<span class="kpi-unit">h</span></p>
          </div>
        </div>
        <div class="kpi-card card">
          <span class="material-icons kpi-icon kpi-icon--red">trending_down</span>
          <div>
            <p class="kpi-label">Costo de tiempo muerto</p>
            <p class="kpi-value kpi-value--red">${{ fmt(store.latestActivityReport?.downtimeCost) }}</p>
          </div>
        </div>
        <div class="kpi-card card">
          <span class="material-icons kpi-icon kpi-icon--amber">build</span>
          <div>
            <p class="kpi-label">Costo total mantenimiento</p>
            <p class="kpi-value kpi-value--amber">${{ fmt(store.latestMaintenanceQuote?.totalMaintenanceCost) }}</p>
          </div>
        </div>
        <div class="kpi-card card">
          <span class="material-icons kpi-icon kpi-icon--green">show_chart</span>
          <div>
            <p class="kpi-label">Índice ROI</p>
            <p class="kpi-value kpi-value--green">{{ fmt(store.latestRoiProjection?.roiIndex, 2) }}%</p>
          </div>
        </div>
      </div>

      <!-- Line Chart: totalUsageTime over time -->
      <div class="chart-card card">
        <h2 class="chart-title">Tiempo de uso — evolución</h2>
        <div v-if="chartPoints.length < 2" class="chart-state">
          <span class="material-icons">show_chart</span>
          <span>Sin datos suficientes</span>
        </div>
        <div v-else class="line-wrap">
          <svg :viewBox="`0 0 ${SVG_W + 60} ${SVG_H + 36}`" preserveAspectRatio="xMidYMid meet" class="line-svg">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#f5bc36" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#f5bc36" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <g v-for="tick in yTicks" :key="tick.value">
              <text :x="44" :y="tick.y + 4" class="axis-label" text-anchor="end">{{ tick.value }}</text>
              <line x1="48" :y1="tick.y" :x2="SVG_W + 48" :y2="tick.y" class="grid-line"/>
            </g>
            <g transform="translate(48,0)">
              <path :d="areaPath" class="area-fill"/>
              <polyline :points="polylinePoints" class="line-stroke"/>
              <g v-for="(pt, i) in chartPoints" :key="i">
                <circle :cx="pt.x" :cy="pt.y" r="5" class="data-dot"/>
                <text :x="pt.x" :y="SVG_H + 22" class="axis-label" text-anchor="middle">{{ pt.label }}</text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      <!-- Tables -->
      <div class="tables-grid">
        <!-- Activity Reports -->
        <div class="table-card card">
          <h2 class="table-title">Reportes de actividad</h2>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr>
                <th>Fecha</th>
                <th>Tiempo uso (h)</th>
                <th>Costo downtime</th>
                <th>Comparación %</th>
              </tr></thead>
              <tbody>
                <tr v-if="!store.activityReports.length">
                  <td colspan="4" class="table-empty">Sin registros</td>
                </tr>
                <tr v-for="r in store.activityReports" :key="r.id">
                  <td class="cell-date">{{ fmtDate(r.createdAt) }}</td>
                  <td>{{ fmt(r.totalUsageTime) }}</td>
                  <td>${{ fmt(r.downtimeCost) }}</td>
                  <td>{{ fmt(r.percentageComparison, 1) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Maintenance Quotes -->
        <div class="table-card card">
          <h2 class="table-title">Cotizaciones de mantenimiento</h2>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr>
                <th>Fecha</th>
                <th>Correctivo</th>
                <th>Repuestos</th>
                <th>Preventivo</th>
                <th>Total</th>
              </tr></thead>
              <tbody>
                <tr v-if="!store.maintenanceQuotes.length">
                  <td colspan="5" class="table-empty">Sin registros</td>
                </tr>
                <tr v-for="q in store.maintenanceQuotes" :key="q.id">
                  <td class="cell-date">{{ fmtDate(q.createdAt) }}</td>
                  <td>${{ fmt(q.correctiveActionsCost) }}</td>
                  <td>${{ fmt(q.sparePartsCost) }}</td>
                  <td>${{ fmt(q.preventiveCost) }}</td>
                  <td class="cell-total">${{ fmt(q.totalMaintenanceCost) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ROI Projections -->
        <div class="table-card card">
          <h2 class="table-title">Proyecciones ROI</h2>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr>
                <th>Fecha</th>
                <th>Costo downtime proy.</th>
                <th>Ganancias proy.</th>
                <th>ROI %</th>
                <th>Demanda</th>
              </tr></thead>
              <tbody>
                <tr v-if="!store.roiProjections.length">
                  <td colspan="5" class="table-empty">Sin registros</td>
                </tr>
                <tr v-for="p in store.roiProjections" :key="p.id">
                  <td class="cell-date">{{ fmtDate(p.createdAt) }}</td>
                  <td>${{ fmt(p.projectedDowntimeCost) }}</td>
                  <td>${{ fmt(p.projectedEarnings) }}</td>
                  <td>{{ fmt(p.roiIndex, 2) }}%</td>
                  <td>
                    <span class="badge" :class="DEMAND_CLASS[p.demandStatus] ?? 'badge--neutral'">
                      {{ DEMAND_LABEL[p.demandStatus] ?? p.demandStatus }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dash-page { display: flex; flex-direction: column; gap: 1.5rem; }
.dash-state { align-items: center; color: var(--text-secondary); display: flex; gap: 0.5rem; height: 200px; justify-content: center; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-banner { align-items: center; background: rgba(239,68,68,.1); border: 1px solid #ef4444; border-radius: var(--radius); color: #ef4444; display: flex; font-size: 0.875rem; gap: 0.5rem; padding: 0.75rem; }

/* Warm olive-amber solid gradient on every card — matches reference */
.kpi-card,
.chart-card,
.table-card {
  background: linear-gradient(160deg, #2e2908 0%, #1d1b05 55%, #131202 100%);
  border: 1px solid rgba(245,188,54,0.14);
}

/* KPI row */
.kpi-row { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); }
.kpi-card { align-items: center; display: flex; gap: 1rem; }
.kpi-icon { font-size: 2rem; }
.kpi-icon--green { color: var(--green); }
.kpi-icon--amber { color: var(--accent); }
.kpi-icon--red   { color: var(--red); }
.kpi-icon--blue  { color: var(--blue); }
.kpi-label { color: var(--text-secondary); font-size: 0.78rem; }
.kpi-value { font-size: 1.75rem; font-weight: 700; }
.kpi-unit  { color: var(--text-secondary); font-size: 1rem; font-weight: 400; margin-left: 2px; }
.kpi-value--amber { color: var(--accent); }
.kpi-value--red   { color: var(--red); }
.kpi-value--green { color: var(--green); }

/* Chart card */
.chart-card { padding: 1.25rem 1.5rem; }
.chart-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 1rem; }
.line-wrap { overflow: hidden; }
.line-svg { height: 290px; width: 100%; }
.grid-line { stroke: rgba(255,255,255,.07); stroke-width: 1; }
.area-fill { fill: url(#areaGrad); }
.line-stroke { fill: none; stroke: var(--accent); stroke-linejoin: round; stroke-width: 2.5; }
.data-dot { fill: var(--accent); stroke: #1d1b05; stroke-width: 2.5; }
.axis-label { fill: var(--text-secondary); font-size: 10px; }
.chart-state { align-items: center; color: var(--text-secondary); display: flex; flex-direction: column; font-size: 0.85rem; gap: 0.5rem; height: 180px; justify-content: center; }

/* Tables */
.tables-grid { display: flex; flex-direction: column; gap: 1rem; }
.table-card { overflow: hidden; }
.table-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 1rem; }
.table-wrap { overflow-x: auto; }
.data-table { border-collapse: collapse; font-size: 0.8rem; width: 100%; }
.data-table th { border-bottom: 1px solid rgba(245,188,54,0.15); color: var(--text-secondary); font-weight: 500; padding: 0.5rem 0.75rem; text-align: left; white-space: nowrap; }
.data-table td { border-bottom: 1px solid rgba(255,255,255,.04); padding: 0.5rem 0.75rem; }
.cell-date  { color: var(--text-secondary); font-family: monospace; white-space: nowrap; }
.cell-total { font-weight: 600; }
.table-empty { color: var(--text-secondary); padding: 1rem 0.75rem; text-align: center; }
.badge { border-radius: 4px; font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.5rem; white-space: nowrap; }
.badge--red     { background: rgba(239,68,68,.15); color: #ef4444; }
.badge--amber   { background: rgba(245,188,54,.15); color: var(--accent); }
.badge--green   { background: rgba(34,197,94,.15); color: var(--green); }
.badge--neutral { background: rgba(255,255,255,.08); color: var(--text-secondary); }

@media (max-width: 1100px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
</style>
