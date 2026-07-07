<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useReservationStore } from '@/reservation/application/reservation.store.js';
import { useEquipmentStore } from '@/gym/application/equipment.store.js';
import { useAnomalyStore } from '@/monitoring/application/anomaly.store.js';

const { t, locale } = useI18n();
const router = useRouter();
const reservationStore = useReservationStore();
const equipmentStore   = useEquipmentStore();
const anomalyStore     = useAnomalyStore();

const form = ref({ reservationId: '', anomalyDescription: '' });

onMounted(() => {
  reservationStore.loadMine();
  equipmentStore.loadEquipment();
});

const dateTimeFormatter = computed(() => new Intl.DateTimeFormat(locale.value, {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
}));
function formatDateTime(value) {
  if (!value) return '—';
  return dateTimeFormatter.value.format(new Date(value));
}

function equipmentName(id) {
  return equipmentStore.equipment.find(e => e.id === id)?.name ?? `EQ-${id}`;
}

function reservationLabel(r) {
  return `${equipmentName(r.equipmentId)} · ${formatDateTime(r.startDate)}–${formatDateTime(r.endDate)}`;
}

const selectedReservation = computed(() =>
  reservationStore.reservations.find(r => r.id === Number(form.value.reservationId)) ?? null);

const isValid = computed(() => !!(form.value.reservationId && form.value.anomalyDescription.trim()));

async function submit() {
  const reservation = selectedReservation.value;
  if (!isValid.value || !reservation) return;
  const zoneId = equipmentStore.equipment.find(e => e.id === reservation.equipmentId)?.zoneId ?? null;
  const created = await anomalyStore.reportAnomaly({
    reservationId: reservation.id,
    equipmentId: reservation.equipmentId,
    zoneId,
    anomalyDescription: form.value.anomalyDescription.trim(),
  });
  if (created) form.value = { reservationId: '', anomalyDescription: '' };
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <button class="btn btn--icon" @click="router.push('/bookings')">
        <span class="material-icons">arrow_back</span>
      </button>
      <div>
        <h1 class="page__title">{{ t('monitoring.anomalyReport.title') }}</h1>
        <p class="page__subtitle">{{ t('monitoring.anomalyReport.subtitle') }}</p>
      </div>
    </div>

    <div class="layout-grid">
      <div class="card section-card">
        <div class="card-header">
          <span class="material-icons card-header__icon" style="color:var(--red)">warning_amber</span>
          <h2 class="section-title">{{ t('monitoring.anomalyReport.formTitle') }}</h2>
        </div>

        <form @submit.prevent="submit">
          <div class="form-group">
            <label>{{ t('monitoring.anomalyReport.reservation') }} *</label>
            <select v-model="form.reservationId" required>
              <option value="" disabled>— {{ t('monitoring.anomalyReport.selectReservation') }} —</option>
              <option v-for="r in reservationStore.reservations" :key="r.id" :value="r.id">
                {{ reservationLabel(r) }}
              </option>
            </select>
            <p v-if="!reservationStore.loading && !reservationStore.reservations.length" class="hint">
              {{ t('monitoring.anomalyReport.noReservations') }}
            </p>
          </div>

          <div class="form-group">
            <label>{{ t('monitoring.anomalyReport.description') }} *</label>
            <textarea v-model="form.anomalyDescription" rows="4"
              :placeholder="t('monitoring.anomalyReport.descriptionPlaceholder')" required></textarea>
          </div>

          <p v-if="anomalyStore.error" class="error-msg">{{ anomalyStore.error }}</p>

          <button type="submit" class="btn btn--primary save-btn" :disabled="anomalyStore.loading || !isValid">
            {{ t('monitoring.anomalyReport.submit') }}
          </button>
        </form>
      </div>

      <div class="card section-card">
        <div class="card-header">
          <span class="material-icons card-header__icon">list_alt</span>
          <h2 class="section-title">{{ t('monitoring.anomalyReport.listTitle') }}</h2>
          <span class="badge badge--red">{{ anomalyStore.reports.length }}</span>
        </div>

        <p v-if="!anomalyStore.reports.length" class="hint">{{ t('monitoring.anomalyReport.noneReported') }}</p>

        <div v-else class="reports-list">
          <div v-for="a in anomalyStore.reports" :key="a.id" class="report-row">
            <div class="report-row__head">
              <span class="material-icons" style="color:var(--red); font-size:16px">warning_amber</span>
              <span class="mono">#{{ a.id }}</span>
              <span class="badge badge--gray">{{ formatDateTime(a.emissionDate) }}</span>
            </div>
            <p class="report-row__desc">{{ a.anomalyDescription }}</p>
            <div class="report-row__meta">
              <span>{{ equipmentName(a.equipmentId) }}</span>
              <span>{{ t('monitoring.anomalyReport.zoneId') }}: {{ a.zoneId }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page__header { align-items: center; display: flex; gap: .75rem; margin-bottom: 1.25rem; }
.page__subtitle { color: var(--text-secondary); font-size: .85rem; margin-top: .2rem; }
.layout-grid { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }
.section-card { padding: 1.25rem; }
.card-header { align-items: center; display: flex; gap: .6rem; margin-bottom: 1rem; }
.card-header__icon { color: var(--accent); font-size: 20px; }
.section-title { flex: 1; font-size: .95rem; font-weight: 700; }
.form-group { display: flex; flex-direction: column; gap: .4rem; margin-bottom: 1rem; }
.form-group label { color: var(--text-secondary); font-size: .8rem; font-weight: 500; }
.hint { color: var(--text-secondary); font-size: .78rem; margin-top: .3rem; }
.error-msg { background: rgba(239,68,68,.1); border: 1px solid var(--red); border-radius: 6px; color: var(--red); font-size: .8rem; margin-bottom: .75rem; padding: .5rem .75rem; }
.save-btn { width: 100%; }
.reports-list { display: flex; flex-direction: column; gap: .6rem; max-height: 420px; overflow-y: auto; }
.report-row { background: var(--bg-surface); border-radius: 8px; padding: .7rem .9rem; }
.report-row__head { align-items: center; display: flex; gap: .5rem; margin-bottom: .4rem; }
.mono { font-family: monospace; font-size: .78rem; }
.report-row__desc { font-size: .85rem; margin-bottom: .4rem; }
.report-row__meta { color: var(--text-secondary); display: flex; font-size: .75rem; gap: .75rem; }
@media (max-width: 700px) { .layout-grid { grid-template-columns: 1fr; } }
</style>
