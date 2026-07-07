<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReservationStore } from '@/reservation/application/reservation.store.js';
import { useEquipmentStore } from '@/gym/application/equipment.store.js';
import { ReservationStatus } from '@/reservation/domain/model/reservation.entity.js';

const { t, locale } = useI18n();
const store       = useReservationStore();
const equipStore  = useEquipmentStore();

const dateTimeFormatter = computed(() => new Intl.DateTimeFormat(locale.value, {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
}));

function formatDateTime(value) {
  if (!value) return '—';
  return dateTimeFormatter.value.format(new Date(value));
}

const showModal  = ref(false);
const form       = ref({ equipmentId: '', windowSeconds: 600 });

const windowOptions = [
  { seconds: 60,   label: t('booking.modal.option1m') },
  { seconds: 600,  label: t('booking.modal.option10m') },
  { seconds: 900,  label: t('booking.modal.option15m') },
  { seconds: 1200, label: t('booking.modal.option20m') },
];

const availableEquipment = computed(() => equipStore.equipment.filter(e => e.status === 'Available'));

const openReservations = computed(() => store.reservations.filter(
  r => r.status !== ReservationStatus.Ended && r.status !== ReservationStatus.Cancelled));

const now = ref(Date.now());
let clock;
onMounted(() => {
  store.loadMine();
  clock = setInterval(() => { now.value = Date.now(); }, 1000);
});
onUnmounted(() => clearInterval(clock));

function openModal() {
  form.value = { equipmentId: '', windowSeconds: 600 };
  showModal.value = true;
}

async function createReservation() {
  if (!form.value.equipmentId) return;
  const start = new Date();
  const end   = new Date(start.getTime() + form.value.windowSeconds * 1000);
  const created = await store.expressCreate(Number(form.value.equipmentId), start.toISOString(), end.toISOString());
  if (created) showModal.value = false;
}

// The reservation window's own length becomes the timer's usage duration (min 1 minute),
// so the client only ever activates once instead of choosing a duration a second time.
function reservationDurationMinutes(r) {
  const ms = new Date(r.endDate).getTime() - new Date(r.startDate).getTime();
  return Math.max(1, Math.round(ms / 60000));
}

async function activate(r) {
  if (r.status === ReservationStatus.Initiated) {
    await store.submitRequest(r.id);
  }
  const updated = store.reservations.find(x => x.id === r.id);
  if (!updated || updated.status !== ReservationStatus.Reserved) return;
  await store.startTimer(r.id, reservationDurationMinutes(updated));
}

function eqName(id) {
  return equipStore.equipment.find(e => e.id === id)?.name ?? `EQ-${id}`;
}

function statusClass(status) {
  return {
    [ReservationStatus.Initiated]: 'badge--gray',
    [ReservationStatus.Reserved]:  'badge--blue',
    [ReservationStatus.Active]:    'badge--green',
    [ReservationStatus.Ended]:     'badge--gray',
    [ReservationStatus.Cancelled]: 'badge--red',
  }[status] ?? 'badge--gray';
}

function statusLabel(status) {
  return t(`booking.status.${status}`);
}

function isExpired(r) {
  return r.status === ReservationStatus.Active && r.timerExpiry && new Date(r.timerExpiry).getTime() <= now.value;
}

function remaining(r) {
  if (!r.timerExpiry) return '--:--';
  const ms = new Date(r.timerExpiry).getTime() - now.value;
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">{{ t('booking.title') }}</h1>
        <p class="page__subtitle">{{ t('booking.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <router-link class="btn btn--outline" to="/anomalies/report">
          <span class="material-icons" style="font-size:16px">report_problem</span>
          {{ t('booking.reportIssue') }}
        </router-link>
        <button class="btn btn--primary" :disabled="store.hasOpenReservation" @click="openModal">
          <span class="material-icons" style="font-size:16px">add</span>
          {{ t('booking.newBooking') }}
        </button>
      </div>
    </div>

    <div class="card info-card">
      <h3 class="info-title">{{ t('booking.how.title') }}</h3>
      <ul class="info-list">
        <li>{{ t('booking.how.item1') }}</li>
        <li>{{ t('booking.how.item2') }}</li>
        <li>{{ t('booking.how.item3') }}</li>
      </ul>
    </div>

    <div v-if="store.loading" class="empty-state card">
      <span class="material-icons empty-icon">hourglass_empty</span>
      <p class="empty-title">{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="!openReservations.length" class="empty-state card">
      <span class="material-icons empty-icon">calendar_month</span>
      <p class="empty-title">{{ t('booking.empty') }}</p>
    </div>

    <div v-else class="reservation-list">
      <div v-for="r in openReservations" :key="r.id" class="card reservation-card">
        <div class="res-main">
          <span class="res-eq">{{ eqName(r.equipmentId) }}</span>
          <span class="badge" :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
        </div>

        <div v-if="isExpired(r)" class="res-expired">
          <span class="material-icons" style="font-size:16px">event_busy</span>
          <div>
            <p class="res-expired__title">{{ t('booking.expired.title') }}</p>
            <p class="res-expired__subtitle">{{ t('booking.expired.subtitle') }}</p>
          </div>
        </div>
        <div v-else-if="r.status === ReservationStatus.Active && r.timerExpiry" class="res-timer">
          <span class="material-icons" style="font-size:16px">timer</span>
          {{ t('booking.timeRemaining') }}: <strong>{{ remaining(r) }}</strong>
        </div>
        <div v-else class="res-dates">
          <span class="material-icons" style="font-size:14px">event</span>
          {{ formatDateTime(r.startDate) }} → {{ formatDateTime(r.endDate) }}
        </div>

        <div class="res-actions">
          <button v-if="r.status === ReservationStatus.Initiated || r.status === ReservationStatus.Reserved"
            class="btn btn--primary btn--sm" :disabled="store.loading" @click="activate(r)">
            {{ t('booking.action.activate') }}
          </button>
          <button v-if="r.status === ReservationStatus.Active && !isExpired(r)"
            class="btn btn--outline btn--sm" @click="store.requestEquipmentAvailable(r.id)">
            {{ t('booking.action.requestAvailable') }}
          </button>
          <button v-if="r.status === ReservationStatus.Active && !isExpired(r)"
            class="btn btn--primary btn--sm" @click="store.end(r.id)">
            {{ t('booking.action.end') }}
          </button>
          <button v-if="isExpired(r)"
            class="btn btn--outline btn--sm" @click="store.end(r.id)">
            {{ t('booking.expired.dismiss') }}
          </button>
          <button v-if="!isExpired(r) && r.status !== ReservationStatus.Ended && r.status !== ReservationStatus.Cancelled"
            class="btn btn--outline btn--sm btn--danger" @click="store.cancel(r.id)">
            {{ t('booking.action.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <div class="history-section">
      <h2 class="section-title">{{ t('booking.history.title') }}</h2>
      <p class="section-subtitle">{{ t('booking.history.subtitle') }}</p>

      <p v-if="!store.historyReservations.length" class="empty-title">{{ t('booking.history.empty') }}</p>
      <table v-else class="history-table">
        <thead>
          <tr>
            <th>{{ t('booking.history.col.equipment') }}</th>
            <th>{{ t('booking.history.col.status') }}</th>
            <th>{{ t('booking.history.col.started') }}</th>
            <th>{{ t('booking.history.col.window') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in store.historyReservations" :key="r.id">
            <td>{{ eqName(r.equipmentId) }}</td>
            <td><span class="badge" :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span></td>
            <td>{{ formatDateTime(r.startDate) }}</td>
            <td>{{ formatDateTime(r.startDate) }} → {{ formatDateTime(r.endDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- New Reservation Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal card">
        <div class="modal-header">
          <h2 class="modal-title">{{ t('booking.modal.title') }}</h2>
          <button class="close-btn" @click="showModal = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <p class="modal-subtitle">{{ t('booking.modal.subtitle') }}</p>

        <div class="form-field">
          <label>{{ t('booking.modal.machine') }}</label>
          <select v-model="form.equipmentId" required>
            <option value="" disabled>— {{ t('booking.modal.selectMachine') }} —</option>
            <option v-for="eq in availableEquipment" :key="eq.id" :value="eq.id">{{ eq.name }}</option>
          </select>
        </div>

        <div class="form-field">
          <label>{{ t('booking.modal.duration') }}</label>
          <select v-model.number="form.windowSeconds">
            <option v-for="opt in windowOptions" :key="opt.seconds" :value="opt.seconds">{{ opt.label }}</option>
          </select>
        </div>

        <p class="modal-warning">{{ t('booking.modal.warning') }}</p>

        <div v-if="store.error" class="error-msg">{{ store.error }}</div>

        <div class="modal-footer">
          <button class="btn btn--outline" @click="showModal = false">{{ t('booking.modal.cancel') }}</button>
          <button class="btn btn--primary" :disabled="store.loading" @click="createReservation">
            {{ t('booking.modal.create') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.page__subtitle { color: var(--text-secondary); font-size: .85rem; margin-top: .25rem; }
.header-actions { align-items: center; display: flex; gap: .6rem; }
.info-card { margin-bottom: 1rem; padding: 1rem 1.25rem; }
.info-title { font-size: .9rem; font-weight: 700; margin-bottom: .5rem; }
.info-list { color: var(--text-secondary); font-size: .82rem; margin: 0; padding-left: 1.1rem; }
.info-list li { margin-bottom: .25rem; }
.reservation-list { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 2rem; }
.reservation-card { display: flex; flex-direction: column; gap: .375rem; padding: .875rem 1rem; }
.res-main { align-items: center; display: flex; gap: .75rem; }
.res-eq { font-size: .9rem; font-weight: 600; }
.res-dates { align-items: center; color: var(--text-secondary); display: flex; font-size: .78rem; gap: .35rem; }
.res-timer { align-items: center; color: var(--accent); display: flex; font-size: .85rem; gap: .35rem; }
.res-expired { align-items: center; background: rgba(158,158,158,.1); border-radius: 6px; display: flex; gap: .5rem; padding: .5rem .75rem; }
.res-expired__title { font-size: .82rem; font-weight: 600; }
.res-expired__subtitle { color: var(--text-secondary); font-size: .75rem; }
.res-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .25rem; }
.btn--sm { font-size: .75rem; padding: .25rem .6rem; }
.btn--danger { border-color: var(--red); color: var(--red); }
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .5rem; padding: 2.5rem; text-align: center; }
.empty-icon { color: var(--text-secondary); font-size: 48px; }
.empty-title { font-size: .95rem; font-weight: 600; }
.history-section { margin-top: .5rem; }
.section-title { font-size: 1rem; font-weight: 700; }
.section-subtitle { color: var(--text-secondary); font-size: .82rem; margin: .2rem 0 .75rem; }
.history-table { border-collapse: collapse; width: 100%; }
.history-table th { border-bottom: 1px solid var(--bg-card); color: var(--text-secondary); font-size: .75rem; padding: .5rem; text-align: left; }
.history-table td { border-bottom: 1px solid var(--bg-card); font-size: .82rem; padding: .5rem; }
.modal-overlay { align-items: center; background: rgba(0,0,0,.5); bottom: 0; display: flex; justify-content: center; left: 0; position: fixed; right: 0; top: 0; z-index: 500; }
.modal { max-width: 440px; padding: 1.5rem; width: 90%; }
.modal-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: .5rem; }
.modal-title { font-size: 1rem; font-weight: 700; }
.modal-subtitle { color: var(--text-secondary); font-size: .8rem; margin-bottom: 1rem; }
.modal-warning { color: var(--text-secondary); font-size: .75rem; margin-bottom: 1rem; }
.close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.form-field { display: flex; flex-direction: column; gap: .4rem; margin-bottom: 1rem; }
.form-field label { color: var(--text-secondary); font-size: .83rem; font-weight: 500; }
.error-msg { background: rgba(239,68,68,.1); border: 1px solid var(--red); border-radius: 6px; color: var(--red); font-size: .8rem; margin-bottom: .75rem; padding: .5rem .75rem; }
.modal-footer { display: flex; gap: .75rem; justify-content: flex-end; }
</style>
