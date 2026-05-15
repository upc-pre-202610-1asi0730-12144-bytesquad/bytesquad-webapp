<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAnalyticsStore } from '@/analytics/application/analytics.store.js';

const { t } = useI18n();
const store = useAnalyticsStore();
const showComparison = ref(false);

// ── Bar chart (Weekly Usage vs Capacity) ─────────────────────────────────────
const BAR_W = 540, BAR_H = 180, BAR_MAX = 600, BAR_CAPACITY = 500;
const BAR_Y_PAD = 36; // left space for y-axis labels
const barYTicks = [0, 150, 300, 450, 600].map(v => ({
  label: String(v),
  y: BAR_H - (v / BAR_MAX) * BAR_H,
}));
const capacityY = BAR_H - (BAR_CAPACITY / BAR_MAX) * BAR_H;

const weeklyBars = computed(() => {
  const days = store.weeklyData;
  if (!days.length) return [];
  const slotW = BAR_W / days.length;
  return days.map((d, i) => ({
    ...d,
    x:          i * slotW + slotW * 0.15,
    width:      slotW * 0.7,
    y:          BAR_H - (d.usage     / BAR_MAX) * BAR_H,
    height:     (d.usage     / BAR_MAX) * BAR_H,
    prevY:      BAR_H - (d.prevUsage / BAR_MAX) * BAR_H,
    prevHeight: (d.prevUsage / BAR_MAX) * BAR_H,
    cx:         i * slotW + slotW * 0.5,
  }));
});

// ── Stress peaks SVG (red) ───────────────────────────────────────────────────
const SP_W = 1060, SP_H = 200, SP_Y_PAD = 36;
const spYTicks = [0, 25, 50, 75, 100].map(v => ({
  label: String(v),
  y: SP_H - (v / 100) * SP_H,
}));
const spThresholdY = SP_H - 0.9 * SP_H;

const spPoints = computed(() =>
  store.hourlyData.map((d, i) => ({
    x: (i / Math.max(store.hourlyData.length - 1, 1)) * SP_W,
    y: SP_H - (d.occupancy / 100) * SP_H,
    ...d,
  }))
);
const spPolyline = computed(() => spPoints.value.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
const spArea = computed(() => {
  const pts = spPoints.value;
  if (!pts.length) return '';
  return `M${pts[0].x},${SP_H} ${pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} L${pts[pts.length - 1].x},${SP_H} Z`;
});
</script>

<template>
  <div class="page analytics-page">

    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div class="analytics-header">
      <div>
        <h1 class="page__title">{{ t('analytics.title') }}</h1>
        <p class="ana-subtitle">{{ t('analytics.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn btn--outline btn--sm">
          <span class="material-icons" style="font-size:15px">download</span>
          {{ t('analytics.exportCsv') }}
        </button>
        <button class="btn btn--accent btn--sm">
          <span class="material-icons" style="font-size:15px">picture_as_pdf</span>
          {{ t('analytics.generatePdf') }}
        </button>
      </div>
    </div>

    <!-- ── Filters ────────────────────────────────────────────────────────── -->
    <div class="filter-bar card">
      <div class="filter-group">
        <label class="filter-label">{{ t('analytics.filters.period.label') }}</label>
        <select v-model="store.selectedPeriod">
          <option value="month">{{ t('analytics.filters.period.month') }}</option>
          <option value="quarter">{{ t('analytics.filters.period.quarter') }}</option>
          <option value="year">{{ t('analytics.filters.period.year') }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">{{ t('analytics.filters.branch.label') }}</label>
        <select v-model="store.selectedBranch">
          <option value="all">{{ t('analytics.filters.branch.all') }}</option>
          <option value="main">{{ t('analytics.filters.branch.main') }}</option>
        </select>
      </div>
      <button class="custom-range-btn">
        <span>{{ t('analytics.filters.customRange') }}</span>
        <span class="material-icons" style="font-size:17px">calendar_today</span>
      </button>
    </div>

    <!-- ── KPI cards ──────────────────────────────────────────────────────── -->
    <div class="kpi-row">
      <div class="kpi-card card">
        <div class="kpi-body">
          <p class="kpi-label">{{ t('analytics.stats.totalHours') }}</p>
          <p class="kpi-val">{{ store.stats.totalHours.toLocaleString() }}h</p>
          <p class="kpi-change kpi-change--green">+{{ store.stats.hoursChange }}% <span class="kpi-meta">{{ t('analytics.stats.vsLastMonth') }}</span></p>
        </div>
        <span class="material-icons kpi-icon kpi-icon--blue">schedule</span>
      </div>
      <div class="kpi-card card">
        <div class="kpi-body">
          <p class="kpi-label">{{ t('analytics.stats.occupancyRate') }}</p>
          <p class="kpi-val">{{ store.stats.occupancy }}%</p>
          <p class="kpi-change kpi-change--green">+{{ store.stats.occupancyChange }}% <span class="kpi-meta">{{ t('analytics.stats.vsLastMonth') }}</span></p>
        </div>
        <span class="material-icons kpi-icon kpi-icon--teal">groups</span>
      </div>
      <div class="kpi-card card">
        <div class="kpi-body">
          <p class="kpi-label">{{ t('analytics.stats.peakUsage') }}</p>
          <p class="kpi-val">{{ store.stats.peak }}%</p>
          <p class="kpi-meta">{{ store.stats.peakTime }}</p>
        </div>
        <span class="material-icons kpi-icon kpi-icon--green">trending_up</span>
      </div>
      <div class="kpi-card card">
        <div class="kpi-body">
          <p class="kpi-label">{{ t('analytics.stats.inactiveTime') }}</p>
          <p class="kpi-val kpi-val--amber">{{ store.stats.inactive }}h</p>
          <p class="kpi-change kpi-change--red">{{ store.stats.inactiveChange }}% <span class="kpi-meta">{{ t('analytics.stats.vsLastMonth') }}</span></p>
        </div>
        <span class="material-icons kpi-icon kpi-icon--amber">circle</span>
      </div>
    </div>

    <!-- ── Charts row ─────────────────────────────────────────────────────── -->
    <div class="charts-row">

      <!-- Bar chart: Weekly Usage vs Capacity -->
      <div class="card chart-card">
        <div class="chart-header">
          <h2 class="chart-title">{{ t('analytics.charts.weeklyUsage') }}</h2>
          <button class="btn btn--outline btn--sm" @click="showComparison = !showComparison">
            {{ showComparison ? t('analytics.charts.hideComparison') : t('analytics.charts.showComparison') }}
          </button>
        </div>
        <svg :viewBox="`0 0 ${BAR_W + BAR_Y_PAD} ${BAR_H + 24}`" preserveAspectRatio="xMidYMid meet" class="bar-svg">
          <!-- Y-axis labels + grid lines -->
          <g v-for="tick in barYTicks" :key="tick.label">
            <text :x="BAR_Y_PAD - 4" :y="tick.y + 4" class="axis-lbl" text-anchor="end">{{ tick.label }}</text>
            <line :x1="BAR_Y_PAD" :y1="tick.y" :x2="BAR_W + BAR_Y_PAD" :y2="tick.y" class="grid-ln"/>
          </g>
          <!-- Capacity dashed line -->
          <line :x1="BAR_Y_PAD" :y1="capacityY" :x2="BAR_W + BAR_Y_PAD" :y2="capacityY"
                stroke="rgba(255,255,255,.25)" stroke-dasharray="6,4" stroke-width="1.5"/>
          <!-- Bars -->
          <g transform="translate(36,0)">
            <g v-for="b in weeklyBars" :key="b.day">
              <!-- prev month (comparison) -->
              <rect v-if="showComparison"
                    :x="b.x" :y="b.prevY" :width="b.width / 2 - 1" :height="b.prevHeight"
                    rx="3" fill="rgba(245,188,54,.3)"/>
              <!-- current month -->
              <rect :x="showComparison ? b.x + b.width / 2 + 1 : b.x"
                    :y="b.y" :width="showComparison ? b.width / 2 - 1 : b.width" :height="b.height"
                    rx="3" fill="var(--accent)"/>
              <!-- Day label -->
              <text :x="b.cx" :y="BAR_H + 16" class="axis-lbl" text-anchor="middle">{{ b.day }}</text>
            </g>
          </g>
        </svg>
      </div>

      <!-- Donut chart: Distribution by Machine Type -->
      <div class="card chart-card">
        <h2 class="chart-title" style="margin-bottom:.75rem">{{ t('analytics.charts.machineTypes') }}</h2>
        <div class="pie-wrap">
          <div class="pie-donut" :style="{ background: `conic-gradient(${store.pieGradient()})` }"></div>
          <div class="pie-legend">
            <div v-for="seg in store.machineTypes" :key="seg.label" class="pie-item">
              <span class="pie-dot" :style="{ background: seg.color }"></span>
              <span class="pie-name">{{ seg.label }}:</span>
              <span class="pie-pct" :style="{ color: seg.color }">{{ seg.pct }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Stress Peaks (full width, red) ────────────────────────────────── -->
    <div class="card chart-card">
      <h2 class="chart-title" style="margin-bottom:.75rem">{{ t('analytics.charts.stressPeaks') }}</h2>
      <svg :viewBox="`0 0 ${SP_W + SP_Y_PAD} ${SP_H + 24}`" preserveAspectRatio="xMidYMid meet" class="stress-svg">
        <defs>
          <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="#ef4444" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <!-- Y-axis labels + grid lines -->
        <g v-for="tick in spYTicks" :key="tick.label">
          <text :x="SP_Y_PAD - 4" :y="tick.y + 4" class="axis-lbl" text-anchor="end">{{ tick.label }}</text>
          <line :x1="SP_Y_PAD" :y1="tick.y" :x2="SP_W + SP_Y_PAD" :y2="tick.y" class="grid-ln"/>
        </g>
        <!-- 90% threshold line + label -->
        <line :x1="SP_Y_PAD" :y1="spThresholdY" :x2="SP_W + SP_Y_PAD" :y2="spThresholdY"
              stroke="#ef4444" stroke-dasharray="6,4" stroke-width="1.5"/>
        <text :x="SP_Y_PAD + 4" :y="spThresholdY - 4" fill="#ef4444" font-size="10" font-weight="700">90%</text>
        <!-- Chart area shifted right -->
        <g :transform="`translate(${SP_Y_PAD},0)`">
          <path :d="spArea"     fill="url(#redGrad)"/>
          <polyline :points="spPolyline" fill="none" stroke="#ef4444" stroke-width="2"/>
          <circle v-for="pt in spPoints" :key="pt.hour" :cx="pt.x" :cy="pt.y" r="4" fill="#ef4444"/>
          <text v-for="(pt, i) in spPoints" :key="`h-${pt.hour}`"
                :x="pt.x" :y="SP_H + 18" class="axis-lbl" text-anchor="middle">{{ pt.hour }}</text>
        </g>
      </svg>
    </div>

    <!-- ── Relocation Recommendations ────────────────────────────────────── -->
    <div class="card">
      <div class="reloc-header">
        <div>
          <h2 class="chart-title">{{ t('analytics.relocation.title') }}</h2>
          <p class="ana-subtitle" style="margin-top:.2rem">{{ t('analytics.relocation.subtitle') }}</p>
        </div>
        <span class="badge badge--amber opps-badge">{{ store.relocationData.length }} {{ t('analytics.relocation.opportunities') }}</span>
      </div>

      <div class="reloc-list">
        <div v-for="r in store.relocationData" :key="r.machine" class="reloc-row card">
          <span class="priority-badge" :class="r.priority === 'HIGH' ? 'priority--high' : 'priority--medium'">
            {{ r.priority }}
          </span>
          <span class="material-icons reloc-machine-icon">{{ r.icon }}</span>
          <span class="reloc-machine-name">{{ r.machine }}</span>

          <div class="reloc-branch">
            <span class="branch-name">{{ r.fromBranch }}</span>
            <div class="occ-bar-track">
              <div class="occ-bar occ-bar--dim" :style="{ width: r.fromOccupancy + '%' }"></div>
            </div>
            <span class="occ-pct occ-pct--dim">{{ r.fromOccupancy }}% ocupación</span>
          </div>

          <span class="material-icons reloc-arrow">arrow_forward</span>

          <div class="reloc-branch">
            <span class="branch-name">{{ r.toBranch }}</span>
            <div class="occ-bar-track">
              <div class="occ-bar occ-bar--green" :style="{ width: r.toOccupancy + '%' }"></div>
            </div>
            <span class="occ-pct occ-pct--green">{{ r.toOccupancy }}% ocupación</span>
          </div>

          <span class="savings">+${{ r.savingsPerMonth.toLocaleString() }}/mes</span>

          <button class="btn btn--outline btn--sm reloc-btn">
            {{ t('analytics.relocation.action') }} →
          </button>
        </div>
      </div>
    </div>

    <!-- ── Executive Summary ──────────────────────────────────────────────── -->
    <div>
      <h2 class="chart-title" style="margin-bottom:.75rem">{{ t('analytics.executive.title') }}</h2>
      <div class="exec-list">
        <div class="exec-card exec-card--green">
          <span class="material-icons exec-icon" style="color:var(--green)">check_circle</span>
          <div>
            <p class="exec-title" style="color:var(--green)">{{ t('analytics.executive.positive.title') }}</p>
            <p class="exec-desc">{{ t('analytics.executive.positive.description') }}</p>
          </div>
        </div>
        <div class="exec-card exec-card--red">
          <span class="material-icons exec-icon" style="color:var(--red)">warning</span>
          <div>
            <p class="exec-title" style="color:var(--red)">{{ t('analytics.executive.bottleneck.title') }}</p>
            <p class="exec-desc">{{ t('analytics.executive.bottleneck.description') }}</p>
          </div>
        </div>
        <div class="exec-card exec-card--amber">
          <span class="material-icons exec-icon" style="color:var(--accent)">schedule</span>
          <div>
            <p class="exec-title" style="color:var(--accent)">{{ t('analytics.executive.optimization.title') }}</p>
            <p class="exec-desc">{{ t('analytics.executive.optimization.description') }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.analytics-page { display: flex; flex-direction: column; gap: 1rem; }
.analytics-header { align-items: flex-start; display: flex; justify-content: space-between; }
.ana-subtitle { color: var(--text-secondary); font-size: .82rem; margin-top: .2rem; }
.header-actions { display: flex; gap: .5rem; flex-shrink: 0; }
.btn--sm { font-size: .8rem; padding: .35rem .85rem; }
.btn--accent { background: var(--accent); border: none; color: #000; font-weight: 600; }

/* Filters */
.filter-bar { align-items: center; display: flex; flex-wrap: wrap; gap: .75rem; padding: .75rem 1.25rem; }
.filter-group { align-items: center; display: flex; flex-direction: column; gap: .2rem; }
.filter-label { color: var(--text-secondary); font-size: .72rem; font-weight: 500; }
.custom-range-btn { align-items: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-secondary); cursor: pointer; display: flex; font-size: .85rem; gap: .4rem; padding: .4rem .85rem; }
.custom-range-btn:hover { border-color: var(--accent); color: var(--text-primary); }

/* KPI */
.kpi-row { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); }
.kpi-card { align-items: center; display: flex; justify-content: space-between; }
.kpi-body { display: flex; flex-direction: column; gap: .2rem; }
.kpi-label { color: var(--text-secondary); font-size: .78rem; }
.kpi-val { font-size: 1.75rem; font-weight: 700; line-height: 1; }
.kpi-val--amber { color: var(--accent); }
.kpi-meta { color: var(--text-secondary); font-size: .72rem; font-weight: 400; }
.kpi-change { font-size: .75rem; font-weight: 600; }
.kpi-change--green { color: var(--green); }
.kpi-change--red   { color: var(--red); }
.kpi-icon { font-size: 2rem; opacity: .5; }
.kpi-icon--blue  { color: var(--blue); }
.kpi-icon--teal  { color: var(--teal); }
.kpi-icon--green { color: var(--green); }
.kpi-icon--amber { color: var(--accent); }

/* Charts row */
.charts-row { display: grid; gap: 1rem; grid-template-columns: 1.4fr 1fr; }
.chart-card { }
.chart-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: .75rem; }
.chart-title { font-size: .9rem; font-weight: 600; }

/* Bar chart SVG */
.bar-svg { height: 210px; width: 100%; }
.axis-lbl { fill: var(--text-secondary); font-size: 10px; }
.grid-ln  { stroke: rgba(255,255,255,.06); stroke-width: 1; }

/* Donut */
.pie-wrap   { align-items: center; display: flex; gap: 2rem; margin-top: .5rem; }
.pie-donut  { border-radius: 50%; flex-shrink: 0; height: 150px; width: 150px; mask: radial-gradient(circle at 50%, transparent 40%, #000 41%); -webkit-mask: radial-gradient(circle at 50%, transparent 40%, #000 41%); }
.pie-legend { display: flex; flex-direction: column; gap: .65rem; }
.pie-item   { align-items: center; display: flex; gap: .5rem; font-size: .85rem; }
.pie-dot    { border-radius: 50%; flex-shrink: 0; height: 10px; width: 10px; }
.pie-name   { color: var(--text-secondary); }
.pie-pct    { font-weight: 700; }

/* Stress peaks SVG */
.stress-svg { height: 240px; width: 100%; }

/* Relocation */
.reloc-header { align-items: flex-start; display: flex; justify-content: space-between; margin-bottom: 1rem; }
.opps-badge   { font-size: .75rem; padding: .3rem .75rem; }
.reloc-list   { display: flex; flex-direction: column; gap: .5rem; }
.reloc-row    { align-items: center; display: flex; flex-wrap: wrap; gap: .75rem; padding: .75rem 1rem; }
.priority-badge { border-radius: 4px; font-size: .68rem; font-weight: 700; padding: .2rem .5rem; flex-shrink: 0; }
.priority--high   { background: rgba(239,68,68,.2);   color: var(--red); }
.priority--medium { background: rgba(245,188,54,.2);  color: var(--accent); }
.reloc-machine-icon { color: var(--text-secondary); flex-shrink: 0; }
.reloc-machine-name { flex: 0 0 130px; font-size: .85rem; font-weight: 600; }
.reloc-branch { display: flex; flex: 1; flex-direction: column; gap: .2rem; min-width: 120px; }
.branch-name  { font-size: .78rem; font-weight: 600; }
.occ-bar-track{ background: rgba(255,255,255,.06); border-radius: 4px; height: 5px; width: 100%; }
.occ-bar      { border-radius: 4px; height: 100%; }
.occ-bar--dim   { background: rgba(255,255,255,.2); }
.occ-bar--green { background: var(--green); }
.occ-pct { font-size: .72rem; }
.occ-pct--dim   { color: var(--text-secondary); }
.occ-pct--green { color: var(--green); }
.reloc-arrow { color: var(--text-secondary); flex-shrink: 0; }
.savings { color: var(--green); font-size: .85rem; font-weight: 700; flex-shrink: 0; min-width: 100px; text-align: right; }
.reloc-btn { flex-shrink: 0; }

/* Executive Summary */
.exec-list { display: flex; flex-direction: column; gap: .6rem; }
.exec-card { align-items: flex-start; border: 1px solid var(--border); border-radius: var(--radius); display: flex; gap: .85rem; padding: 1rem 1.25rem; }
.exec-card--green { border-color: rgba(34,197,94,.3);   background: rgba(34,197,94,.06); }
.exec-card--red   { border-color: rgba(239,68,68,.3);   background: rgba(239,68,68,.06); }
.exec-card--amber { border-color: rgba(245,188,54,.3);  background: rgba(245,188,54,.06); }
.exec-icon { flex-shrink: 0; font-size: 20px; margin-top: 1px; }
.exec-title { font-size: .88rem; font-weight: 700; margin-bottom: .2rem; }
.exec-desc  { color: var(--text-secondary); font-size: .8rem; line-height: 1.45; }

@media (max-width: 1100px) { .charts-row { grid-template-columns: 1fr 1fr; } }
@media (max-width: 900px)  { .kpi-row { grid-template-columns: 1fr 1fr; } .charts-row { grid-template-columns: 1fr; } }
@media (max-width: 600px)  { .kpi-row { grid-template-columns: 1fr; } .reloc-row { flex-wrap: wrap; } }
</style>
