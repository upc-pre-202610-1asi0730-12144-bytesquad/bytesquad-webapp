<script setup>
import { useI18n } from 'vue-i18n';
import { useDashboardStore } from '@/dashboard/application/dashboard.store.js';

const { t } = useI18n();
const store = useDashboardStore();

const SVG_W = store.SVG_W, SVG_H = store.SVG_H;
const yTicks = [0, 25, 50, 75, 100].map(v => ({ label: String(v), y: SVG_H - (v / 100) * SVG_H }));

function barShortName(name) { return name.length > 10 ? name.slice(0, 8) + '…' : name; }
function roiClass(roi) { return roi === 'Alto' ? 'green' : roi === 'Medio' ? 'amber' : 'red'; }
function ticketDesc(type) { return type === 'CORRECTIVE' ? t('maintenance.types.corrective') : t('maintenance.types.preventive'); }
</script>

<template>
  <div class="dash-page page">
    <div class="kpi-row">
      <div class="kpi-card card">
        <span class="material-icons kpi-icon kpi-icon--green">check_circle</span>
        <div><p class="kpi-label">{{ t('dashboardAdmin.kpis.operationalEquipment') }}</p><p class="kpi-value">{{ store.operationalCount }}</p></div>
      </div>
      <div class="kpi-card card">
        <span class="material-icons kpi-icon kpi-icon--amber">build</span>
        <div><p class="kpi-label">{{ t('dashboardAdmin.kpis.maintenance') }}</p><p class="kpi-value kpi-value--amber">{{ store.maintenanceCount }}</p></div>
      </div>
      <div class="kpi-card card">
        <span class="material-icons kpi-icon kpi-icon--red">cancel</span>
        <div><p class="kpi-label">{{ t('dashboardAdmin.kpis.outOfService') }}</p><p class="kpi-value kpi-value--red">{{ store.outOfOrderCount }}</p></div>
      </div>
      <div class="kpi-card card">
        <span class="material-icons kpi-icon kpi-icon--blue">confirmation_number</span>
        <div><p class="kpi-label">{{ t('dashboardAdmin.kpis.totalTickets') }}</p><p class="kpi-value">{{ store.totalTickets }}</p></div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card card">
        <h2 class="chart-title">{{ t('dashboardAdmin.charts.peakCapacityHours') }}</h2>
        <div class="line-wrap">
          <svg :viewBox="`0 0 ${SVG_W} ${SVG_H + 24}`" preserveAspectRatio="none" class="line-svg">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#f5bc36" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#f5bc36" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <line v-for="tick in yTicks" :key="tick.label" x1="0" :y1="tick.y" :x2="SVG_W" :y2="tick.y" class="grid-line"/>
            <path :d="store.areaPath" class="area-fill"/>
            <polyline :points="store.polylinePoints" class="line-stroke"/>
            <circle v-for="pt in store.linePoints" :key="pt.hour" :cx="pt.x" :cy="pt.y" r="5" class="data-dot"/>
            <text v-for="(pt, i) in store.linePoints" v-show="i % 2 === 0 || i === store.linePoints.length - 1" :key="`lbl-${pt.hour}`" :x="pt.x" :y="SVG_H + 18" class="axis-label" text-anchor="middle">{{ pt.hour }}</text>
          </svg>
        </div>
      </div>

      <div class="chart-card card">
        <h2 class="chart-title">{{ t('dashboardAdmin.charts.machineUsage') }}</h2>
        <div v-if="store.loading" class="chart-state"><span class="material-icons spin">sync</span></div>
        <div v-else-if="!store.machineUsageBars.length" class="chart-state"><span class="material-icons">bar_chart</span></div>
        <div v-else class="bar-chart-wrap">
          <div class="bar-chart">
            <div v-for="bar in store.machineUsageBars" :key="bar.name" class="bar-col">
              <span class="bar-hours">{{ bar.hours }}h</span>
              <div class="bar-track"><div class="bar-fill" :style="{ height: (bar.hours / store.maxBarHours * 100) + '%' }"></div></div>
              <span class="bar-label">{{ barShortName(bar.name) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-row">
      <div class="table-card card">
        <h2 class="chart-title">{{ t('dashboardAdmin.table.title') }}</h2>
        <table class="data-table">
          <thead><tr>
            <th>{{ t('dashboardAdmin.table.headers.machineId') }}</th>
            <th>{{ t('dashboardAdmin.table.headers.location') }}</th>
            <th>{{ t('dashboardAdmin.table.headers.hours') }}</th>
            <th>{{ t('dashboardAdmin.table.headers.roi') }}</th>
          </tr></thead>
          <tbody>
            <tr v-if="!store.underutilizedEquipment.length"><td colspan="4" class="table-empty">{{ t('dashboardAdmin.table.empty') }}</td></tr>
            <tr v-for="row in store.underutilizedEquipment" :key="row.machineId">
              <td class="cell-id">{{ row.machineId }}</td>
              <td>{{ row.location }}</td>
              <td>{{ row.hours }}</td>
              <td><span class="badge" :class="`badge--${roiClass(row.roi)}`">{{ row.roi }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="kanban-card card">
        <h2 class="chart-title">{{ t('dashboardAdmin.maintenanceCenter.title') }}</h2>
        <div class="kanban-board">
          <div class="kanban-col">
            <p class="kanban-col__header">{{ t('dashboardAdmin.maintenanceCenter.columns.todo') }}</p>
            <p v-if="!store.pendingTickets.length" class="kanban-empty">{{ t('dashboardAdmin.maintenanceCenter.empty') }}</p>
            <div v-for="t2 in store.pendingTickets" :key="t2.id" class="kanban-item kanban-item--open">
              <div class="ki-top"><span class="material-icons ki-icon--warn">warning</span><span class="ki-id">{{ store.ticketLabel(t2.id) }}</span></div>
              <p class="ki-name">{{ store.equipmentName(t2.equipmentId) }}</p>
              <p class="ki-desc">{{ ticketDesc(t2.type) }}</p>
            </div>
          </div>
          <div class="kanban-col">
            <p class="kanban-col__header">{{ t('dashboardAdmin.maintenanceCenter.columns.inProgress') }}</p>
            <p v-if="!store.inProgressTickets.length" class="kanban-empty">{{ t('dashboardAdmin.maintenanceCenter.empty') }}</p>
            <div v-for="t2 in store.inProgressTickets" :key="t2.id" class="kanban-item kanban-item--progress">
              <div class="ki-top"><span class="material-icons ki-icon--blue">build</span><span class="ki-id">{{ store.ticketLabel(t2.id) }}</span></div>
              <p class="ki-name">{{ store.equipmentName(t2.equipmentId) }}</p>
            </div>
          </div>
          <div class="kanban-col">
            <p class="kanban-col__header">{{ t('dashboardAdmin.maintenanceCenter.columns.completed') }}</p>
            <p v-if="!store.resolvedTickets.length" class="kanban-empty">{{ t('dashboardAdmin.maintenanceCenter.empty') }}</p>
            <div v-for="t2 in store.resolvedTickets" :key="t2.id" class="kanban-item kanban-item--resolved">
              <div class="ki-top"><span class="material-icons ki-icon--green">task_alt</span><span class="ki-id">{{ store.ticketLabel(t2.id) }}</span></div>
              <p class="ki-name">{{ store.equipmentName(t2.equipmentId) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dash-page { display: flex; flex-direction: column; gap: 1.5rem; }
.kpi-row { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); }
.kpi-card { align-items: center; display: flex; gap: 1rem; }
.kpi-icon { font-size: 2rem; }
.kpi-icon--green { color: var(--green); }
.kpi-icon--amber { color: var(--accent); }
.kpi-icon--red   { color: var(--red); }
.kpi-icon--blue  { color: var(--blue); }
.kpi-label { color: var(--text-secondary); font-size: 0.8rem; }
.kpi-value { font-size: 1.75rem; font-weight: 700; }
.kpi-value--amber { color: var(--accent); }
.kpi-value--red   { color: var(--red); }
.charts-row { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }
.chart-card { min-height: 260px; }
.chart-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 1rem; }
.line-wrap { overflow: hidden; }
.line-svg { width: 100%; height: 180px; }
.grid-line { stroke: rgba(255,255,255,.06); stroke-width: 1; }
.area-fill { fill: url(#areaGrad); }
.line-stroke { fill: none; stroke: var(--accent); stroke-width: 2; }
.data-dot { fill: var(--accent); }
.axis-label { fill: var(--text-secondary); font-size: 10px; }
.bar-chart-wrap { overflow-x: auto; }
.bar-chart { display: flex; gap: 6px; height: 180px; align-items: flex-end; padding: 0 4px; }
.bar-col { align-items: center; display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 32px; }
.bar-hours { color: var(--text-secondary); font-size: 0.65rem; }
.bar-track { background: rgba(255,255,255,.06); border-radius: 4px; flex: 1; width: 100%; position: relative; }
.bar-fill { background: var(--accent); border-radius: 4px; bottom: 0; position: absolute; width: 100%; transition: height .3s; }
.bar-label { color: var(--text-secondary); font-size: 0.65rem; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.chart-state { align-items: center; display: flex; flex-direction: column; height: 160px; justify-content: center; color: var(--text-secondary); }
.bottom-row { display: grid; gap: 1rem; grid-template-columns: 1fr 1.5fr; }
.data-table { border-collapse: collapse; font-size: 0.8rem; width: 100%; }
.data-table th { border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 500; padding: 0.5rem 0.75rem; text-align: left; }
.data-table td { border-bottom: 1px solid rgba(255,255,255,.04); padding: 0.5rem 0.75rem; }
.cell-id { color: var(--accent); font-family: monospace; }
.table-empty { color: var(--text-secondary); padding: 0.75rem; }
.kanban-board { display: grid; gap: 0.75rem; grid-template-columns: repeat(3, 1fr); }
.kanban-col__header { color: var(--text-secondary); font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase; }
.kanban-empty { color: var(--text-secondary); font-size: 0.75rem; }
.kanban-item { border-radius: 8px; border-left: 3px solid; margin-bottom: 6px; padding: 0.5rem 0.625rem; font-size: 0.78rem; }
.kanban-item--open     { background: rgba(245,188,54,.08); border-color: var(--accent); }
.kanban-item--progress { background: rgba(59,130,246,.08); border-color: var(--blue); }
.kanban-item--resolved { background: rgba(34,197,94,.08); border-color: var(--green); }
.ki-top { align-items: center; display: flex; gap: 0.375rem; margin-bottom: 0.25rem; }
.ki-icon--warn  { color: var(--accent); font-size: 14px; }
.ki-icon--blue  { color: var(--blue); font-size: 14px; }
.ki-icon--green { color: var(--green); font-size: 14px; }
.ki-id   { color: var(--text-secondary); font-size: 0.7rem; }
.ki-name { font-size: 0.78rem; font-weight: 500; }
.ki-desc { color: var(--text-secondary); font-size: 0.7rem; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1100px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } .charts-row, .bottom-row { grid-template-columns: 1fr; } }
</style>
