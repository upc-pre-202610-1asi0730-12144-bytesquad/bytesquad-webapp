<script setup>
import { useI18n } from 'vue-i18n';
import { useFinancialImpactStore } from '@/financial-impact/application/financial-impact.store.js';

const { t } = useI18n();
const store = useFinancialImpactStore();

const maxLoss    = Math.max(...[3200,2800,4100,3600,5200,4700]);
const maxRoiAbs  = (data) => Math.max(...data.map(d => Math.abs(d.value)), 1);

function roiBarHeight(val, data) { return Math.round((Math.abs(val) / maxRoiAbs(data)) * 100); }
function roiZeroLinePct(data) {
  const max = maxRoiAbs(data), min = Math.min(...data.map(d => d.value));
  return min < 0 ? Math.round((Math.abs(min) / (max - min)) * 100) : 0;
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('financialImpact.title') }}</h1>
      <div style="display:flex;gap:.5rem">
        <button class="btn btn--outline" style="font-size:.8rem">CSV</button>
        <button class="btn btn--outline" style="font-size:.8rem">PDF</button>
      </div>
    </div>

    <div class="kpi-row">
      <div class="kpi-card card"><p class="kpi-label">{{ t('analytics.stats.totalHours') }}</p><p class="kpi-val">{{ store.stats.totalHours }}h</p></div>
      <div class="kpi-card card"><p class="kpi-label">{{ t('analytics.stats.occupancyRate') }}</p><p class="kpi-val">{{ store.stats.occupancy }}%</p></div>
      <div class="kpi-card card"><p class="kpi-label">{{ t('analytics.stats.inactiveTime') }}</p><p class="kpi-val kpi-val--red">{{ store.stats.inactive }}h</p></div>
      <div class="kpi-card card"><p class="kpi-label">{{ t('analytics.stats.peakUsage') }}</p><p class="kpi-val">{{ store.stats.peak }}%</p></div>
    </div>

    <div class="charts-row">
      <div class="chart-card card">
        <h2 class="chart-title">{{ t('financialImpact.lossTable.title') }}</h2>
        <table class="data-table" style="margin-top:.75rem">
          <thead><tr><th>{{ t('financialImpact.lossTable.month') }}</th><th>{{ t('financialImpact.lossTable.lossAmount') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="row in store.inactivityLoss" :key="row.month">
              <td>{{ row.month }}</td>
              <td style="color:var(--red)">${{ row.loss.toLocaleString() }}</td>
              <td style="width:40%">
                <div class="loss-bar-track"><div class="loss-bar-fill" :style="{ width: Math.round((row.loss/maxLoss)*100) + '%' }"></div></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="chart-card card">
        <h2 class="chart-title">{{ t('financialImpact.costBreakdown.title') }}</h2>
        <div class="pie-wrap" style="margin-top:.75rem">
          <div class="pie-donut" :style="{ background: `conic-gradient(${store.maintenancePieGradient()})` }"></div>
          <div class="pie-legend">
            <div v-for="seg in store.maintenanceTypes" :key="seg.label" class="pie-item">
              <span class="pie-dot" :style="{ background: seg.color }"></span>
              <span>{{ seg.label }}</span>
              <span class="pie-pct">{{ seg.pct }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-card card">
      <h2 class="chart-title">{{ t('financialImpact.roiProjection.title') }}</h2>
      <div class="roi-chart">
        <div v-for="d in store.roiProjectionData" :key="d.month" class="roi-col">
          <div class="roi-bar-wrap">
            <div class="roi-bar" :class="d.value >= 0 ? 'roi-bar--pos' : 'roi-bar--neg'" :style="{ height: roiBarHeight(d.value, store.roiProjectionData) + '%' }"></div>
          </div>
          <span class="roi-label">{{ d.month }}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="chart-title" style="margin-bottom:1rem">{{ t('financialImpact.simulator.title') }}</h2>
      <div class="sim-grid">
        <div class="form-field">
          <label>{{ t('financialImpact.simulator.machineCost') }}</label>
          <input type="number" v-model.number="store.simMachineCost" min="0" step="100" />
        </div>
        <div class="form-field">
          <label>{{ t('financialImpact.simulator.unmetDemand') }}</label>
          <input type="number" v-model.number="store.simUnmetDemand" min="0" />
        </div>
        <div class="form-field">
          <label>{{ t('financialImpact.simulator.revenuePerUser') }}</label>
          <input type="number" v-model.number="store.simRevenuePerUser" min="0" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kpi-row { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); margin-bottom: 1rem; }
.kpi-card { display: flex; flex-direction: column; gap: .25rem; }
.kpi-label { color: var(--text-secondary); font-size: .8rem; }
.kpi-val { font-size: 1.75rem; font-weight: 700; }
.kpi-val--red { color: var(--red); }
.charts-row { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; margin-bottom: 1rem; }
.chart-title { font-size: .9rem; font-weight: 600; }
.data-table { border-collapse: collapse; font-size: .82rem; width: 100%; }
.data-table th { border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 500; padding: .4rem .5rem; text-align: left; }
.data-table td { border-bottom: 1px solid rgba(255,255,255,.04); padding: .4rem .5rem; }
.loss-bar-track { background: rgba(255,255,255,.08); border-radius: 4px; height: 6px; width: 100%; }
.loss-bar-fill  { background: var(--red); border-radius: 4px; height: 100%; transition: width .3s; }
.pie-wrap { align-items: center; display: flex; gap: 1.5rem; }
.pie-donut { border-radius: 50%; flex-shrink: 0; height: 120px; width: 120px; mask: radial-gradient(circle at 50%, transparent 38%, #000 39%); -webkit-mask: radial-gradient(circle at 50%, transparent 38%, #000 39%); }
.pie-legend { display: flex; flex-direction: column; gap: .5rem; }
.pie-item { align-items: center; display: flex; font-size: .82rem; gap: .5rem; }
.pie-dot { border-radius: 50%; flex-shrink: 0; height: 10px; width: 10px; }
.pie-pct { color: var(--text-secondary); margin-left: auto; }
.roi-chart { display: flex; gap: 4px; height: 140px; align-items: flex-end; margin-top: .75rem; }
.roi-col { align-items: center; display: flex; flex: 1; flex-direction: column; gap: 4px; }
.roi-bar-wrap { display: flex; flex: 1; align-items: flex-end; width: 100%; }
.roi-bar { border-radius: 4px 4px 0 0; min-height: 2px; width: 100%; transition: height .3s; }
.roi-bar--pos { background: var(--green); }
.roi-bar--neg { background: var(--red); }
.roi-label { color: var(--text-secondary); font-size: .7rem; }
.sim-grid { display: grid; gap: 1rem; grid-template-columns: repeat(3, 1fr); }
.form-field { display: flex; flex-direction: column; gap: .375rem; }
.form-field label { color: var(--text-secondary); font-size: .8rem; }
@media (max-width: 900px) { .kpi-row, .charts-row, .sim-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .kpi-row, .charts-row, .sim-grid { grid-template-columns: 1fr; } }
</style>
