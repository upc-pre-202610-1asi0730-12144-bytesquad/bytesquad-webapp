<script setup>
import { onMounted } from 'vue';
import { useDashboardStore } from '@/dashboard/application/dashboard.store.js';

const store = useDashboardStore();
onMounted(() => store.load());

const DEMAND_CLASS = {
  HIGH_DEMAND:   'badge--red',
  UNDER_REVIEW:  'badge--amber',
  STABLE_DEMAND: 'badge--green',
};
const DEMAND_LABEL = {
  HIGH_DEMAND:   'Alta demanda',
  UNDER_REVIEW:  'En revisión',
  STABLE_DEMAND: 'Estable',
};

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
            <p class="kpi-label">Costo total de mantenimiento</p>
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
.dash-state { align-items: center; display: flex; height: 200px; justify-content: center; color: var(--text-secondary); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-banner { align-items: center; background: rgba(239,68,68,.1); border: 1px solid #ef4444; border-radius: var(--radius); color: #ef4444; display: flex; font-size: 0.875rem; gap: 0.5rem; padding: 0.75rem; }
.kpi-row { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); }
.kpi-card { align-items: center; display: flex; gap: 1rem; }
.kpi-icon { font-size: 2rem; }
.kpi-icon--green { color: var(--green); }
.kpi-icon--amber { color: var(--accent); }
.kpi-icon--red   { color: var(--red); }
.kpi-icon--blue  { color: var(--blue); }
.kpi-label { color: var(--text-secondary); font-size: 0.8rem; }
.kpi-value { font-size: 1.75rem; font-weight: 700; }
.kpi-unit  { font-size: 1rem; font-weight: 400; margin-left: 2px; color: var(--text-secondary); }
.kpi-value--amber { color: var(--accent); }
.kpi-value--red   { color: var(--red); }
.kpi-value--green { color: var(--green); }
.tables-grid { display: flex; flex-direction: column; gap: 1rem; }
.table-card { overflow: hidden; }
.table-wrap { overflow-x: auto; }
.table-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 1rem; }
.data-table { border-collapse: collapse; font-size: 0.8rem; width: 100%; }
.data-table th { border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 500; padding: 0.5rem 0.75rem; text-align: left; white-space: nowrap; }
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
