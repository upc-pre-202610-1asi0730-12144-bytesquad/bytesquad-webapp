<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/authentication/application/auth.store.js';
import { useActivityReportStore } from '@/analytics/application/activity-report.store.js';
import { useMaintenanceQuoteStore } from '@/analytics/application/maintenance-quote.store.js';
import { useRoiProjectionStore } from '@/analytics/application/roi-projection.store.js';

const { t }    = useI18n();
const auth     = useAuthStore();
const arStore  = useActivityReportStore();
const mqStore  = useMaintenanceQuoteStore();
const roiStore = useRoiProjectionStore();

const openAr  = ref(true);
const openMq  = ref(false);
const openRoi = ref(false);

const ar  = ref({ totalUsageTime: '', downtimeCost: '', percentageComparison: '' });
const mq  = ref({ correctiveActionsCost: '', sparePartsCost: '', preventiveCost: '' });
const roi = ref({ projectedDowntimeCost: '', projectedEarnings: '' });

const arSuccess  = ref(false);
const mqSuccess  = ref(false);
const roiSuccess = ref(false);

const recentAr  = computed(() => [...arStore.activityReports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
const recentMq  = computed(() => [...mqStore.quotes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
const recentRoi = computed(() => [...roiStore.projections].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtMoney(v) { return v != null ? '$' + Number(v).toLocaleString() : '—'; }
function fmtNum(v)   { return v != null ? Number(v).toLocaleString() : '—'; }

function demandClass(s) {
  if (s === 'HIGH_DEMAND') return 'badge--green';
  if (s === 'STABLE_DEMAND') return 'badge--blue';
  return 'badge--amber';
}

onMounted(() => {
  const id = auth.user?.id;
  if (!id) return;
  Promise.all([
    arStore.loadByAdmin(id),
    mqStore.loadByAdmin(id),
    roiStore.loadByAdmin(id),
  ]);
});

async function submitActivityReport() {
  arSuccess.value = false;
  const result = await arStore.createReport(
    Number(ar.value.totalUsageTime),
    Number(ar.value.downtimeCost),
    Number(ar.value.percentageComparison),
  );
  if (result) {
    ar.value = { totalUsageTime: '', downtimeCost: '', percentageComparison: '' };
    arSuccess.value = true;
    setTimeout(() => { arSuccess.value = false; }, 3000);
  }
}

async function submitMaintenanceQuote() {
  mqSuccess.value = false;
  const result = await mqStore.createCompleteQuote({
    correctiveActionsCost: Number(mq.value.correctiveActionsCost),
    sparePartsCost:        Number(mq.value.sparePartsCost),
    preventiveCost:        Number(mq.value.preventiveCost),
  });
  if (result) {
    mq.value = { correctiveActionsCost: '', sparePartsCost: '', preventiveCost: '' };
    mqSuccess.value = true;
    setTimeout(() => { mqSuccess.value = false; }, 3000);
  }
}

async function submitRoiProjection() {
  roiSuccess.value = false;
  const result = await roiStore.createCompleteProjection({
    projectedDowntimeCost: Number(roi.value.projectedDowntimeCost),
    projectedEarnings:     Number(roi.value.projectedEarnings),
  });
  if (result) {
    roi.value = { projectedDowntimeCost: '', projectedEarnings: '' };
    roiSuccess.value = true;
    setTimeout(() => { roiSuccess.value = false; }, 3000);
  }
}
</script>

<template>
  <div class="page af-page">

    <div class="page__header">
      <h1 class="page__title">{{ t('analyticsRecords.title') }}</h1>
      <p class="af-subtitle">{{ t('analyticsRecords.subtitle') }}</p>
    </div>

    <!-- ── Activity Report ─────────────────────────────────────────────────── -->
    <div class="section card">
      <button class="section__header" @click="openAr = !openAr">
        <div class="section__title-group">
          <span class="material-icons section__icon section__icon--blue">timeline</span>
          <span class="section__title">{{ t('analyticsRecords.activityReport.title') }}</span>
          <span class="badge badge--outline">{{ arStore.activityReports.length }}</span>
          <span v-if="arStore.loading" class="material-icons spin section__spin">sync</span>
        </div>
        <span class="material-icons chevron" :class="{ 'chevron--open': openAr }">expand_more</span>
      </button>

      <div v-if="openAr" class="section__body">
        <div class="split">
          <!-- Form -->
          <form class="af-form" @submit.prevent="submitActivityReport">
            <h3 class="form-title">{{ t('analyticsRecords.activityReport.formTitle') }}</h3>
            <label class="field">
              <span class="field__label">{{ t('analyticsRecords.activityReport.totalUsageTime') }}</span>
              <input v-model="ar.totalUsageTime" type="number" min="0" required :placeholder="t('analyticsRecords.placeholderNumber')" />
            </label>
            <label class="field">
              <span class="field__label">{{ t('analyticsRecords.activityReport.downtimeCost') }}</span>
              <input v-model="ar.downtimeCost" type="number" min="0" required :placeholder="t('analyticsRecords.placeholderMoney')" />
            </label>
            <label class="field">
              <span class="field__label">{{ t('analyticsRecords.activityReport.percentageComparison') }}</span>
              <input v-model="ar.percentageComparison" type="number" step="0.01" required :placeholder="t('analyticsRecords.placeholderPercent')" />
            </label>
            <div v-if="arStore.error" class="af-alert af-alert--error">{{ arStore.error }}</div>
            <div v-if="arSuccess" class="af-alert af-alert--success">{{ t('analyticsRecords.successMessage') }}</div>
            <button class="btn btn--primary" type="submit" :disabled="arStore.loading">
              <span v-if="arStore.loading" class="material-icons spin" style="font-size:16px">sync</span>
              {{ t('analyticsRecords.submit') }}
            </button>
          </form>

          <!-- Recent records -->
          <div class="recent">
            <h3 class="form-title">{{ t('analyticsRecords.recentRecords') }}</h3>
            <div v-if="!recentAr.length" class="recent__empty">{{ t('analyticsRecords.noRecords') }}</div>
            <table v-else class="mini-table">
              <thead><tr>
                <th>{{ t('analyticsRecords.activityReport.totalUsageTime') }}</th>
                <th>{{ t('analyticsRecords.activityReport.downtimeCost') }}</th>
                <th>%</th>
                <th>{{ t('analyticsRecords.date') }}</th>
              </tr></thead>
              <tbody>
                <tr v-for="r in recentAr" :key="r.activityReportId">
                  <td>{{ fmtNum(r.totalUsageTime) }}h</td>
                  <td>{{ fmtMoney(r.downtimeCost) }}</td>
                  <td>{{ r.percentageComparison != null ? r.percentageComparison + '%' : '—' }}</td>
                  <td class="cell-date">{{ fmtDate(r.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Maintenance Quote ───────────────────────────────────────────────── -->
    <div class="section card">
      <button class="section__header" @click="openMq = !openMq">
        <div class="section__title-group">
          <span class="material-icons section__icon section__icon--amber">build</span>
          <span class="section__title">{{ t('analyticsRecords.maintenanceQuote.title') }}</span>
          <span class="badge badge--outline">{{ mqStore.quotes.length }}</span>
          <span v-if="mqStore.loading" class="material-icons spin section__spin">sync</span>
        </div>
        <span class="material-icons chevron" :class="{ 'chevron--open': openMq }">expand_more</span>
      </button>

      <div v-if="openMq" class="section__body">
        <div class="split">
          <!-- Form -->
          <form class="af-form" @submit.prevent="submitMaintenanceQuote">
            <h3 class="form-title">{{ t('analyticsRecords.maintenanceQuote.formTitle') }}</h3>
            <label class="field">
              <span class="field__label">{{ t('analyticsRecords.maintenanceQuote.correctiveActionsCost') }}</span>
              <input v-model="mq.correctiveActionsCost" type="number" min="0" step="0.01" required :placeholder="t('analyticsRecords.placeholderMoney')" />
            </label>
            <label class="field">
              <span class="field__label">{{ t('analyticsRecords.maintenanceQuote.sparePartsCost') }}</span>
              <input v-model="mq.sparePartsCost" type="number" min="0" step="0.01" required :placeholder="t('analyticsRecords.placeholderMoney')" />
            </label>
            <label class="field">
              <span class="field__label">{{ t('analyticsRecords.maintenanceQuote.preventiveCost') }}</span>
              <input v-model="mq.preventiveCost" type="number" min="0" step="0.01" required :placeholder="t('analyticsRecords.placeholderMoney')" />
            </label>
            <div class="af-info">{{ t('analyticsRecords.maintenanceQuote.autoConsolidate') }}</div>
            <div v-if="mqStore.error" class="af-alert af-alert--error">{{ mqStore.error }}</div>
            <div v-if="mqSuccess" class="af-alert af-alert--success">{{ t('analyticsRecords.successMessage') }}</div>
            <button class="btn btn--primary" type="submit" :disabled="mqStore.loading">
              <span v-if="mqStore.loading" class="material-icons spin" style="font-size:16px">sync</span>
              {{ t('analyticsRecords.submit') }}
            </button>
          </form>

          <!-- Recent records -->
          <div class="recent">
            <h3 class="form-title">{{ t('analyticsRecords.recentRecords') }}</h3>
            <div v-if="!recentMq.length" class="recent__empty">{{ t('analyticsRecords.noRecords') }}</div>
            <table v-else class="mini-table">
              <thead><tr>
                <th>{{ t('analyticsRecords.maintenanceQuote.correctiveActionsCost') }}</th>
                <th>{{ t('analyticsRecords.maintenanceQuote.sparePartsCost') }}</th>
                <th>{{ t('analyticsRecords.maintenanceQuote.preventiveCost') }}</th>
                <th>{{ t('analyticsRecords.maintenanceQuote.total') }}</th>
                <th>{{ t('analyticsRecords.date') }}</th>
              </tr></thead>
              <tbody>
                <tr v-for="q in recentMq" :key="q.maintenanceQuoteId">
                  <td>{{ fmtMoney(q.correctiveActionsCost) }}</td>
                  <td>{{ fmtMoney(q.sparePartsCost) }}</td>
                  <td>{{ fmtMoney(q.preventiveCost) }}</td>
                  <td class="cell-total">{{ fmtMoney(q.totalMaintenanceCost) }}</td>
                  <td class="cell-date">{{ fmtDate(q.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ── ROI Projection ──────────────────────────────────────────────────── -->
    <div class="section card">
      <button class="section__header" @click="openRoi = !openRoi">
        <div class="section__title-group">
          <span class="material-icons section__icon section__icon--green">trending_up</span>
          <span class="section__title">{{ t('analyticsRecords.roiProjection.title') }}</span>
          <span class="badge badge--outline">{{ roiStore.projections.length }}</span>
          <span v-if="roiStore.loading" class="material-icons spin section__spin">sync</span>
        </div>
        <span class="material-icons chevron" :class="{ 'chevron--open': openRoi }">expand_more</span>
      </button>

      <div v-if="openRoi" class="section__body">
        <div class="split">
          <!-- Form -->
          <form class="af-form" @submit.prevent="submitRoiProjection">
            <h3 class="form-title">{{ t('analyticsRecords.roiProjection.formTitle') }}</h3>
            <label class="field">
              <span class="field__label">{{ t('analyticsRecords.roiProjection.projectedDowntimeCost') }}</span>
              <input v-model="roi.projectedDowntimeCost" type="number" min="0" step="0.01" required :placeholder="t('analyticsRecords.placeholderMoney')" />
            </label>
            <label class="field">
              <span class="field__label">{{ t('analyticsRecords.roiProjection.projectedEarnings') }}</span>
              <input v-model="roi.projectedEarnings" type="number" min="0" step="0.01" required :placeholder="t('analyticsRecords.placeholderMoney')" />
            </label>
            <div class="af-info">{{ t('analyticsRecords.roiProjection.autoGenerate') }}</div>
            <div v-if="roiStore.error" class="af-alert af-alert--error">{{ roiStore.error }}</div>
            <div v-if="roiSuccess" class="af-alert af-alert--success">{{ t('analyticsRecords.successMessage') }}</div>
            <button class="btn btn--primary" type="submit" :disabled="roiStore.loading">
              <span v-if="roiStore.loading" class="material-icons spin" style="font-size:16px">sync</span>
              {{ t('analyticsRecords.submit') }}
            </button>
          </form>

          <!-- Recent records -->
          <div class="recent">
            <h3 class="form-title">{{ t('analyticsRecords.recentRecords') }}</h3>
            <div v-if="!recentRoi.length" class="recent__empty">{{ t('analyticsRecords.noRecords') }}</div>
            <table v-else class="mini-table">
              <thead><tr>
                <th>{{ t('analyticsRecords.roiProjection.projectedDowntimeCost') }}</th>
                <th>{{ t('analyticsRecords.roiProjection.projectedEarnings') }}</th>
                <th>ROI</th>
                <th>{{ t('analyticsRecords.roiProjection.demand') }}</th>
                <th>{{ t('analyticsRecords.date') }}</th>
              </tr></thead>
              <tbody>
                <tr v-for="p in recentRoi" :key="p.roiProjectionId">
                  <td>{{ fmtMoney(p.projectedDowntimeCost) }}</td>
                  <td>{{ fmtMoney(p.projectedEarnings) }}</td>
                  <td>{{ p.roiIndex != null ? p.roiIndex.toFixed(2) : '—' }}</td>
                  <td>
                    <span v-if="p.demandStatus" class="badge" :class="demandClass(p.demandStatus)" style="font-size:.7rem">
                      {{ p.demandStatus.replace(/_/g, ' ') }}
                    </span>
                    <span v-else>—</span>
                  </td>
                  <td class="cell-date">{{ fmtDate(p.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.af-page { display: flex; flex-direction: column; gap: 1rem; }
.page__header { margin-bottom: .25rem; }
.af-subtitle { color: var(--text-secondary); font-size: .82rem; margin-top: .2rem; }

/* Accordion section */
.section { padding: 0; overflow: hidden; }
.section__header {
  align-items: center; background: none; border: none; color: var(--text-primary);
  cursor: pointer; display: flex; justify-content: space-between;
  padding: 1rem 1.25rem; width: 100%;
}
.section__header:hover { background: rgba(255,255,255,.03); }
.section__title-group { align-items: center; display: flex; gap: .75rem; }
.section__icon { font-size: 1.1rem; }
.section__icon--blue  { color: var(--blue); }
.section__icon--amber { color: var(--accent); }
.section__icon--green { color: var(--green); }
.section__title { font-size: .9rem; font-weight: 600; }
.section__spin  { color: var(--text-secondary); font-size: 1rem; }
.badge--outline { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); font-size: .72rem; padding: .15rem .5rem; }
.badge--blue    { background: rgba(59,130,246,.18); color: #93c5fd; }

.chevron { color: var(--text-secondary); font-size: 1.2rem; transition: transform .2s; }
.chevron--open { transform: rotate(180deg); }

.section__body { border-top: 1px solid var(--border); padding: 1.25rem; }

/* 2-col split */
.split { display: grid; gap: 1.5rem; grid-template-columns: 340px 1fr; }

/* Form */
.af-form { display: flex; flex-direction: column; gap: .75rem; }
.form-title { color: var(--text-secondary); font-size: .8rem; font-weight: 600; margin-bottom: .25rem; text-transform: uppercase; letter-spacing: .04em; }
.field { display: flex; flex-direction: column; gap: .3rem; }
.field__label { color: var(--text-secondary); font-size: .8rem; }
.af-info { background: rgba(245,188,54,.08); border: 1px solid rgba(245,188,54,.2); border-radius: var(--radius); color: var(--accent); font-size: .75rem; padding: .5rem .75rem; }
.af-alert { border-radius: var(--radius); font-size: .8rem; padding: .5rem .75rem; }
.af-alert--error   { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: var(--red); }
.af-alert--success { background: rgba(34,197,94,.1);  border: 1px solid rgba(34,197,94,.3);  color: var(--green); }

/* Mini table */
.recent { display: flex; flex-direction: column; gap: .5rem; min-width: 0; }
.recent__empty { color: var(--text-secondary); font-size: .82rem; padding: .5rem 0; }
.mini-table { border-collapse: collapse; font-size: .78rem; width: 100%; }
.mini-table th { background: var(--bg-surface); border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 500; padding: .45rem .75rem; text-align: left; white-space: nowrap; }
.mini-table td { border-bottom: 1px solid rgba(255,255,255,.04); padding: .45rem .75rem; }
.cell-date  { color: var(--text-secondary); font-size: .72rem; white-space: nowrap; }
.cell-total { color: var(--green); font-weight: 600; }

.spin { animation: spin 1s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .split { grid-template-columns: 1fr; }
}
</style>
