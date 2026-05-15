<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFinancialImpactStore } from '@/financial-impact/application/financial-impact.store.js';

const { t } = useI18n();
const store = useFinancialImpactStore();

const showResult = ref(false);
function calculateRoi() { showResult.value = true; }

// ── ROI chart SVG ─────────────────────────────────────────────────────────────
const ROI_W    = 1040;   // chart area width
const ROI_H    = 240;    // chart area height (zero line at 120)
const ROI_YPAD = 40;     // left space for y-axis labels
const ZERO_Y   = 120;    // y-coordinate of the 0 line

const roiYTicks = [6000, 3000, 0, -3000, -6000].map(v => ({
  label: v === 0 ? '0' : (v > 0 ? `${v/1000}k` : `-${Math.abs(v)/1000}k`),
  y: ZERO_Y - (v / 6000) * 120,
}));

const roiBars = computed(() => {
  const data   = store.roiProjectionData;
  const slotW  = ROI_W / data.length;
  return data.map((d, i) => {
    const pos = store.roiBarPos(d.value);
    return { ...d, ...pos, x: i * slotW + slotW * 0.08, width: slotW * 0.84, cx: i * slotW + slotW * 0.5 };
  });
});

// ── Maintenance breakdown max for progress bars ───────────────────────────────
const maxBreakdownAmount = computed(() =>
  Math.max(...store.maintenanceBreakdown.map(b => b.amount), 1)
);
</script>

<template>
  <div class="page fi-page">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="fi-header">
      <div>
        <h1 class="page__title">{{ t('financialImpact.title') }}</h1>
        <p class="fi-subtitle">{{ t('financialImpact.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn btn--outline btn--sm">
          <span class="material-icons" style="font-size:14px">download</span>
          {{ t('financialImpact.exportCsv') }}
        </button>
        <button class="btn btn--accent btn--sm">
          <span class="material-icons" style="font-size:14px">picture_as_pdf</span>
          {{ t('financialImpact.generatePdf') }}
        </button>
      </div>
    </div>

    <!-- ── KPI cards ───────────────────────────────────────────────────────── -->
    <div class="kpi-row">
      <div class="kpi-card card">
        <div>
          <p class="kpi-label">{{ t('financialImpact.stats.lossInactivity') }}</p>
          <p class="kpi-val kpi-val--red">${{ store.totalInactivityLoss.toLocaleString() }}</p>
          <p class="kpi-meta">{{ t('financialImpact.stats.lastMonth') }}</p>
        </div>
        <span class="material-icons kpi-icon" style="color:var(--red)">trending_down</span>
      </div>
      <div class="kpi-card card">
        <div>
          <p class="kpi-label">{{ t('financialImpact.stats.maintenanceCost') }}</p>
          <p class="kpi-val kpi-val--amber">${{ store.totalMaintenanceCost.toLocaleString() }}</p>
          <p class="kpi-meta">{{ t('financialImpact.stats.lastMonth') }}</p>
        </div>
        <span class="material-icons kpi-icon" style="color:var(--accent)">attach_money</span>
      </div>
      <div class="kpi-card card">
        <div>
          <p class="kpi-label">{{ t('financialImpact.stats.potentialSavings') }}</p>
          <p class="kpi-val kpi-val--green">$1,840</p>
          <p class="kpi-meta">{{ t('financialImpact.stats.withPredictive') }}</p>
        </div>
        <span class="material-icons kpi-icon" style="color:var(--green)">trending_up</span>
      </div>
      <div class="kpi-card card">
        <div>
          <p class="kpi-label">{{ t('financialImpact.stats.avgRoi') }}</p>
          <p class="kpi-val">7.2 <span style="font-size:1rem;font-weight:400">{{ t('financialImpact.stats.months') }}</span></p>
          <p class="kpi-meta">{{ t('financialImpact.stats.investmentRecovery') }}</p>
        </div>
        <span class="material-icons kpi-icon" style="color:var(--accent)">grid_view</span>
      </div>
    </div>

    <!-- ── Two-column section ─────────────────────────────────────────────── -->
    <div class="mid-row">

      <!-- Inactivity Loss table -->
      <div class="card">
        <h2 class="chart-title">{{ t('financialImpact.lossTable.title') }}</h2>
        <table class="loss-table">
          <thead>
            <tr>
              <th>{{ t('financialImpact.lossTable.machine') }}</th>
              <th>{{ t('financialImpact.lossTable.hours') }}</th>
              <th>{{ t('financialImpact.lossTable.ratePerHour') }}</th>
              <th>{{ t('financialImpact.lossTable.total') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in store.inactivityMachines" :key="m.machine">
              <td class="td-machine">{{ m.machine }}</td>
              <td><span class="hours-badge">{{ m.hours }}h</span></td>
              <td class="td-muted">${{ m.ratePerHour }}</td>
              <td class="td-loss">${{ m.total.toLocaleString() }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="tf-label">{{ t('financialImpact.lossTable.monthlyTotal') }}</td>
              <td class="tf-total">${{ store.totalInactivityLoss.toLocaleString() }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Maintenance Cost Breakdown -->
      <div class="card">
        <h2 class="chart-title" style="margin-bottom:.75rem">{{ t('financialImpact.costBreakdown.title') }}</h2>
        <div class="pie-wrap">
          <div class="pie-donut" :style="{ background: `conic-gradient(${store.maintenancePieGradient()})` }"></div>
          <div class="pie-legend">
            <div v-for="b in store.maintenanceBreakdown" :key="b.labelKey" class="pie-item">
              <span class="pie-dot" :style="{ background: b.color }"></span>
              <span class="pie-name">{{ t(`financialImpact.costLabels.${b.labelKey}`) }}:</span>
              <span class="pie-amt" :style="{ color: b.color }">${{ b.amount.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Progress bars -->
        <div class="breakdown-bars">
          <div v-for="b in store.maintenanceBreakdown" :key="`bar-${b.labelKey}`" class="breakdown-row">
            <span class="breakdown-label">{{ t(`financialImpact.costLabels.${b.labelKey}`) }}</span>
            <div class="breakdown-track">
              <div class="breakdown-fill"
                   :style="{ width: Math.round((b.amount / maxBreakdownAmount) * 100) + '%', background: b.color }">
              </div>
            </div>
            <span class="breakdown-amt" :style="{ color: b.color }">${{ b.amount.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── ROI Projection chart (full width) ─────────────────────────────── -->
    <div class="card">
      <h2 class="chart-title" style="margin-bottom:.75rem">{{ t('financialImpact.roiProjection.title') }}</h2>
      <svg :viewBox="`0 0 ${ROI_W + ROI_YPAD} ${ROI_H + 24}`" preserveAspectRatio="xMidYMid meet" class="roi-svg">
        <!-- Y-axis labels + grid lines -->
        <g v-for="tick in roiYTicks" :key="tick.label">
          <text :x="ROI_YPAD - 4" :y="tick.y + 4" class="axis-lbl" text-anchor="end">{{ tick.label }}</text>
          <line :x1="ROI_YPAD" :y1="tick.y" :x2="ROI_W + ROI_YPAD" :y2="tick.y"
                :stroke="tick.label === '0' ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.06)'" stroke-width="1"/>
        </g>
        <!-- Bars -->
        <g :transform="`translate(${ROI_YPAD}, 0)`">
          <g v-for="b in roiBars" :key="b.month">
            <rect :x="b.x" :y="b.y" :width="b.width" :height="Math.max(b.height, 2)"
                  rx="3" fill="#ef4444"/>
            <text :x="b.cx" :y="ROI_H + 16" class="axis-lbl" text-anchor="middle">{{ b.month }}</text>
          </g>
        </g>
      </svg>
    </div>

    <!-- ── ROI Simulator ──────────────────────────────────────────────────── -->
    <div class="card">
      <h2 class="chart-title sim-title">
        <span class="material-icons" style="color:var(--accent);font-size:18px">grid_view</span>
        {{ t('financialImpact.simulator.title') }}
      </h2>
      <div class="sim-grid">
        <div class="sim-field">
          <label class="sim-label">{{ t('financialImpact.simulator.machineCost') }}</label>
          <div class="sim-input-wrap">
            <input type="number" v-model.number="store.simMachineCost" min="0" step="500" @input="showResult = false"/>
            <button class="sim-clear" @click="store.simMachineCost = 5000; showResult = false">
              <span class="material-icons" style="font-size:16px">close</span>
            </button>
          </div>
        </div>
        <div class="sim-field">
          <label class="sim-label">{{ t('financialImpact.simulator.unmetDemand') }}</label>
          <div class="sim-input-wrap">
            <input type="number" v-model.number="store.simUnmetDemand" min="0" @input="showResult = false"/>
            <button class="sim-clear" @click="store.simUnmetDemand = 120; showResult = false">
              <span class="material-icons" style="font-size:16px">close</span>
            </button>
          </div>
        </div>
        <div class="sim-field">
          <label class="sim-label">{{ t('financialImpact.simulator.revenuePerUser') }}</label>
          <div class="sim-input-wrap">
            <input type="number" v-model.number="store.simRevenuePerUser" min="0" @input="showResult = false"/>
            <button class="sim-clear" @click="store.simRevenuePerUser = 45; showResult = false">
              <span class="material-icons" style="font-size:16px">close</span>
            </button>
          </div>
        </div>
      </div>
      <button class="btn btn--accent btn--calculate" @click="calculateRoi">
        <span class="material-icons" style="font-size:16px">grid_view</span>
        {{ t('financialImpact.simulator.calculate') }}
      </button>

      <div v-if="showResult && store.simResult" class="sim-result card">
        <div class="sim-result-item">
          <span class="sim-result-label">Payback period</span>
          <span class="sim-result-val" style="color:var(--accent)">{{ store.simResult.paybackMonths }} months</span>
        </div>
        <div class="sim-result-item">
          <span class="sim-result-label">Annual revenue</span>
          <span class="sim-result-val" style="color:var(--green)">${{ store.simResult.annualReturn.toLocaleString() }}</span>
        </div>
        <div class="sim-result-item">
          <span class="sim-result-label">Net first year</span>
          <span class="sim-result-val" :style="{ color: store.simResult.netAnnual >= 0 ? 'var(--green)' : 'var(--red)' }">
            ${{ store.simResult.netAnnual.toLocaleString() }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Financial Recommendations ─────────────────────────────────────── -->
    <div>
      <h2 class="chart-title" style="margin-bottom:.75rem">{{ t('financialImpact.recommendations.title') }}</h2>
      <div class="rec-list">
        <div class="rec-card rec-card--green">
          <span class="material-icons rec-icon" style="color:var(--green)">check_circle</span>
          <div>
            <p class="rec-title" style="color:var(--green)">{{ t('financialImpact.recommendations.preventive.title') }}</p>
            <p class="rec-desc">{{ t('financialImpact.recommendations.preventive.description') }}</p>
          </div>
        </div>
        <div class="rec-card rec-card--amber">
          <span class="material-icons rec-icon" style="color:var(--accent)">trending_up</span>
          <div>
            <p class="rec-title" style="color:var(--accent)">{{ t('financialImpact.recommendations.investment.title') }}</p>
            <p class="rec-desc">{{ t('financialImpact.recommendations.investment.description') }}</p>
          </div>
        </div>
        <div class="rec-card rec-card--amber-dim">
          <span class="material-icons rec-icon" style="color:var(--accent)">warning</span>
          <div>
            <p class="rec-title" style="color:var(--accent)">{{ t('financialImpact.recommendations.relocation.title') }}</p>
            <p class="rec-desc">{{ t('financialImpact.recommendations.relocation.description') }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.fi-page { display: flex; flex-direction: column; gap: 1rem; }
.fi-header { align-items: flex-start; display: flex; justify-content: space-between; }
.fi-subtitle { color: var(--text-secondary); font-size: .82rem; margin-top: .2rem; }
.header-actions { display: flex; gap: .5rem; flex-shrink: 0; }
.btn--sm { font-size: .8rem; padding: .35rem .85rem; }
.btn--accent { background: var(--accent); border: none; color: #000; font-weight: 600; }

/* KPI */
.kpi-row { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); }
.kpi-card { align-items: center; display: flex; justify-content: space-between; }
.kpi-label { color: var(--text-secondary); font-size: .78rem; margin-bottom: .2rem; }
.kpi-val { font-size: 1.75rem; font-weight: 700; line-height: 1; }
.kpi-val--red   { color: var(--red); }
.kpi-val--amber { color: var(--accent); }
.kpi-val--green { color: var(--green); }
.kpi-meta { color: var(--text-secondary); font-size: .72rem; margin-top: .2rem; }
.kpi-icon { font-size: 2.2rem; opacity: .55; }

/* Mid row */
.mid-row { display: grid; gap: 1rem; grid-template-columns: 1.2fr 1fr; }
.chart-title { font-size: .9rem; font-weight: 600; }

/* Inactivity table */
.loss-table { border-collapse: collapse; font-size: .82rem; margin-top: .75rem; width: 100%; }
.loss-table th { border-bottom: 1px solid var(--border); color: var(--text-secondary); font-size: .75rem; font-weight: 600; letter-spacing: .04em; padding: .4rem .5rem; text-align: left; text-transform: uppercase; }
.loss-table td { border-bottom: 1px solid rgba(255,255,255,.04); padding: .5rem .5rem; }
.loss-table tfoot td { border-top: 1px solid var(--border); border-bottom: none; padding-top: .65rem; }
.td-machine { font-weight: 500; }
.td-muted { color: var(--text-secondary); }
.td-loss { color: var(--red); font-weight: 600; }
.hours-badge { background: var(--red); border-radius: 4px; color: #fff; font-size: .72rem; font-weight: 700; padding: .15rem .45rem; }
.tf-label { color: var(--text-secondary); font-size: .75rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
.tf-total { color: var(--red); font-size: .95rem; font-weight: 700; }

/* Maintenance donut */
.pie-wrap  { align-items: center; display: flex; gap: 2rem; margin-bottom: 1.25rem; }
.pie-donut { border-radius: 50%; flex-shrink: 0; height: 140px; width: 140px; mask: radial-gradient(circle at 50%, #111 38%, #000 39%); -webkit-mask: radial-gradient(circle at 50%, #111 38%, #000 39%); }
.pie-legend { display: flex; flex-direction: column; gap: .5rem; }
.pie-item  { align-items: flex-start; display: flex; flex-direction: column; font-size: .78rem; gap: .05rem; }
.pie-dot   { border-radius: 50%; flex-shrink: 0; height: 8px; width: 8px; display: inline-block; margin-right: .35rem; vertical-align: middle; }
.pie-name  { color: var(--text-secondary); }
.pie-amt   { font-weight: 700; }

/* Breakdown bars */
.breakdown-bars { display: flex; flex-direction: column; gap: .65rem; }
.breakdown-row  { align-items: center; display: flex; gap: .75rem; }
.breakdown-label { color: var(--text-secondary); flex: 0 0 220px; font-size: .75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.breakdown-track { background: rgba(255,255,255,.07); border-radius: 3px; flex: 1; height: 6px; }
.breakdown-fill  { border-radius: 3px; height: 100%; transition: width .3s; }
.breakdown-amt   { flex-shrink: 0; font-size: .8rem; font-weight: 700; min-width: 55px; text-align: right; }

/* ROI chart */
.roi-svg { height: 280px; width: 100%; }
.axis-lbl { fill: var(--text-secondary); font-size: 10px; }

/* Simulator */
.sim-title { align-items: center; display: flex; gap: .5rem; margin-bottom: 1rem; }
.sim-grid  { display: grid; gap: 1rem; grid-template-columns: repeat(3, 1fr); margin-bottom: 1rem; }
.sim-field { display: flex; flex-direction: column; gap: .35rem; }
.sim-label { color: var(--text-secondary); font-size: .8rem; font-weight: 500; }
.sim-input-wrap { align-items: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); display: flex; padding: .4rem .6rem; }
.sim-input-wrap input { background: transparent; border: none; color: var(--text-primary); flex: 1; font-size: .95rem; min-width: 0; outline: none; }
.sim-input-wrap:focus-within { border-color: var(--accent); }
.sim-clear { background: none; border: none; color: var(--text-secondary); cursor: pointer; flex-shrink: 0; padding: 0; }
.sim-clear:hover { color: var(--red); }
.btn--calculate { align-items: center; display: flex; font-size: .9rem; gap: .5rem; justify-content: center; padding: .75rem; width: 100%; }
.sim-result { background: var(--bg-surface); display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: center; margin-top: .75rem; padding: 1rem 1.5rem; }
.sim-result-item { align-items: center; display: flex; flex-direction: column; gap: .25rem; }
.sim-result-label { color: var(--text-secondary); font-size: .78rem; }
.sim-result-val   { font-size: 1.25rem; font-weight: 700; }

/* Recommendations */
.rec-list { display: flex; flex-direction: column; gap: .6rem; }
.rec-card { align-items: flex-start; border: 1px solid var(--border); border-radius: var(--radius); display: flex; gap: .85rem; padding: 1rem 1.25rem; }
.rec-card--green     { border-color: rgba(34,197,94,.3);   background: rgba(34,197,94,.06); }
.rec-card--amber     { border-color: rgba(245,188,54,.3);  background: rgba(245,188,54,.06); }
.rec-card--amber-dim { border-color: rgba(245,188,54,.2);  background: rgba(245,188,54,.04); }
.rec-icon { flex-shrink: 0; margin-top: 1px; }
.rec-title { font-size: .88rem; font-weight: 700; margin-bottom: .2rem; }
.rec-desc  { color: var(--text-secondary); font-size: .8rem; line-height: 1.45; }

@media (max-width: 1100px) { .mid-row { grid-template-columns: 1fr; } }
@media (max-width: 900px)  { .kpi-row { grid-template-columns: 1fr 1fr; } .sim-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px)  { .kpi-row { grid-template-columns: 1fr; } .sim-grid { grid-template-columns: 1fr; } }
</style>
