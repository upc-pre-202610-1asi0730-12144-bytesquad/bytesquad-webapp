<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAnalyticsStore } from '@/analytics/application/analytics.store.js';

const { t } = useI18n();
const store = useAnalyticsStore();
const showComparison = ref(false);

function barPct(val) { return store.maxCapacity ? Math.round((val / store.maxCapacity) * 100) : 0; }
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('analytics.title') }}</h1>
      <div style="display:flex;gap:.5rem">
        <button class="btn btn--outline" style="font-size:.8rem"><span class="material-icons" style="font-size:15px">download</span> CSV</button>
        <button class="btn btn--outline" style="font-size:.8rem"><span class="material-icons" style="font-size:15px">picture_as_pdf</span> PDF</button>
      </div>
    </div>

    <div class="filter-bar card">
      <select v-model="store.selectedBranch" style="width:auto">
        <option value="all">{{ t('analytics.filters.branch.all') }}</option>
        <option value="main">{{ t('analytics.filters.branch.main') }}</option>
      </select>
    </div>

    <div class="kpi-row">
      <div class="kpi-card card"><p class="kpi-label">{{ t('analytics.stats.totalHours') }}</p><p class="kpi-val">{{ store.stats.totalHours }}h</p><p class="kpi-change kpi-change--green">+{{ store.stats.hoursChange }}% <span style="font-weight:400;color:var(--text-secondary)">{{ t('analytics.stats.vsLastMonth') }}</span></p></div>
      <div class="kpi-card card"><p class="kpi-label">{{ t('analytics.stats.occupancyRate') }}</p><p class="kpi-val">{{ store.stats.occupancy }}%</p><p class="kpi-change kpi-change--green">+{{ store.stats.occupancyChange }}% <span style="font-weight:400;color:var(--text-secondary)">{{ t('analytics.stats.vsLastMonth') }}</span></p></div>
      <div class="kpi-card card"><p class="kpi-label">{{ t('analytics.stats.peakUsage') }}</p><p class="kpi-val">{{ store.stats.peak }}%</p><p class="kpi-sub">{{ store.stats.peakTime }}</p></div>
      <div class="kpi-card card"><p class="kpi-label">{{ t('analytics.stats.inactiveTime') }}</p><p class="kpi-val kpi-val--red">{{ store.stats.inactive }}h</p><p class="kpi-change kpi-change--green">{{ store.stats.inactiveChange }}% <span style="font-weight:400;color:var(--text-secondary)">{{ t('analytics.stats.vsLastMonth') }}</span></p></div>
    </div>

    <div class="charts-row">
      <div class="chart-card card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
          <h2 class="chart-title">{{ t('analytics.charts.weeklyUsage') }}</h2>
          <label style="display:flex;align-items:center;gap:.5rem;font-size:.8rem;cursor:pointer">
            <input type="checkbox" v-model="showComparison" /> {{ showComparison ? t('analytics.charts.hideComparison') : t('analytics.charts.showComparison') }}
          </label>
        </div>
        <div class="bar-group">
          <div v-for="d in store.weeklyData" :key="d.day" class="bar-col">
            <div class="bars">
              <div class="bar bar--curr" :style="{ height: barPct(d.usage) + '%' }"></div>
              <div v-if="showComparison" class="bar bar--prev" :style="{ height: barPct(d.prevUsage) + '%' }"></div>
            </div>
            <span class="bar-label">{{ d.day }}</span>
          </div>
        </div>
      </div>

      <div class="chart-card card">
        <h2 class="chart-title" style="margin-bottom:.75rem">{{ t('analytics.charts.machineTypes') }}</h2>
        <div class="pie-wrap">
          <div class="pie-donut" :style="{ background: `conic-gradient(${store.pieGradient()})` }"></div>
          <div class="pie-legend">
            <div v-for="seg in store.machineTypes" :key="seg.label" class="pie-item">
              <span class="pie-dot" :style="{ background: seg.color }"></span>
              <span>{{ seg.label }}</span>
              <span class="pie-pct">{{ seg.pct }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-card card">
      <h2 class="chart-title" style="margin-bottom:.75rem">{{ t('analytics.charts.stressPeaks') }}</h2>
      <div class="line-wrap">
        <svg :viewBox="`0 0 ${store.SVG_W} ${store.SVG_H + 24}`" preserveAspectRatio="none" class="line-svg">
          <defs>
            <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f5bc36" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="#f5bc36" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <line x1="0" :y1="store.threshold90Y" :x2="store.SVG_W" :y2="store.threshold90Y" stroke="#ef4444" stroke-dasharray="6,4" stroke-width="1.5"/>
          <path :d="store.areaPath" fill="url(#ag2)"/>
          <polyline :points="store.polylinePoints" fill="none" stroke="#f5bc36" stroke-width="2"/>
          <circle v-for="pt in store.linePoints" :key="pt.hour" :cx="pt.x" :cy="pt.y" r="4" fill="#f5bc36"/>
          <text v-for="(pt, i) in store.linePoints" :key="`h-${pt.hour}`" v-show="i % 2 === 0" :x="pt.x" :y="store.SVG_H + 18" fill="#9e9e9e" font-size="10" text-anchor="middle">{{ pt.hour }}</text>
        </svg>
      </div>
    </div>

    <div v-if="store.relocationData.length" class="card" style="margin-top:0">
      <h2 class="chart-title" style="margin-bottom:.75rem">{{ t('analytics.relocation.title') }}</h2>
      <table class="data-table">
        <thead><tr><th></th><th>From</th><th>To</th><th>Savings</th><th></th></tr></thead>
        <tbody>
          <tr v-for="r in store.relocationData" :key="r.machine">
            <td>{{ r.machine }}</td>
            <td>{{ r.fromBranch }} ({{ r.fromOccupancy }}%)</td>
            <td>{{ r.toBranch }} ({{ r.toOccupancy }}%)</td>
            <td>${{ r.savingsPerMonth }}/mo</td>
            <td><span class="badge" :class="r.priority === 'HIGH' ? 'badge--red' : r.priority === 'MEDIUM' ? 'badge--amber' : 'badge--green'">{{ r.priority }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.filter-bar { margin-bottom: 1rem; }
.kpi-row { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); margin-bottom: 1rem; }
.kpi-card { display: flex; flex-direction: column; gap: .25rem; }
.kpi-label { color: var(--text-secondary); font-size: .8rem; }
.kpi-val { font-size: 1.75rem; font-weight: 700; }
.kpi-val--red { color: var(--red); }
.kpi-sub  { color: var(--text-secondary); font-size: .75rem; }
.kpi-change { font-size: .75rem; font-weight: 600; }
.kpi-change--green { color: var(--green); }
.charts-row { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; margin-bottom: 1rem; }
.chart-card { }
.chart-title { font-size: .9rem; font-weight: 600; }
.bar-group { display: flex; gap: 6px; height: 160px; align-items: flex-end; }
.bar-col { align-items: center; display: flex; flex: 1; flex-direction: column; gap: 4px; }
.bars { display: flex; gap: 2px; flex: 1; align-items: flex-end; width: 100%; }
.bar { border-radius: 4px 4px 0 0; flex: 1; min-height: 2px; transition: height .3s; }
.bar--curr { background: var(--accent); }
.bar--prev { background: rgba(245,188,54,.35); }
.bar-label { color: var(--text-secondary); font-size: .72rem; }
.pie-wrap { align-items: center; display: flex; gap: 1.5rem; margin-top: .5rem; }
.pie-donut { border-radius: 50%; flex-shrink: 0; height: 120px; width: 120px; mask: radial-gradient(circle at 50%, transparent 38%, #000 39%); -webkit-mask: radial-gradient(circle at 50%, transparent 38%, #000 39%); }
.pie-legend { display: flex; flex-direction: column; gap: .5rem; }
.pie-item { align-items: center; display: flex; gap: .5rem; font-size: .82rem; }
.pie-dot { border-radius: 50%; height: 10px; width: 10px; flex-shrink: 0; }
.pie-pct { color: var(--text-secondary); margin-left: auto; }
.line-wrap { overflow: hidden; }
.line-svg { height: 200px; width: 100%; }
.data-table { border-collapse: collapse; font-size: .82rem; width: 100%; }
.data-table th { background: var(--bg-surface); border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 500; padding: .5rem .75rem; text-align: left; }
.data-table td { border-bottom: 1px solid rgba(255,255,255,.04); padding: .5rem .75rem; }
@media (max-width: 900px) { .kpi-row, .charts-row { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .kpi-row, .charts-row { grid-template-columns: 1fr; } }
</style>
