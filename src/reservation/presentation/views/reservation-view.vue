<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReservationStore } from '@/reservation/application/reservation.store.js';
import { gymState } from '@/shared/application/gym-state.service.js';

const { t } = useI18n();
const store = useReservationStore();

const showModal = ref(false);
const selectedMachineId = ref('');
const selectedDuration  = ref(600);

const DURATIONS = [
  { value: 10,   label: 'booking.modal.option10s' },
  { value: 600,  label: 'booking.modal.option10m' },
  { value: 900,  label: 'booking.modal.option15m' },
  { value: 1200, label: 'booking.modal.option20m' },
];

const canCreate = computed(() => !!selectedMachineId.value);

function openModal() {
  selectedMachineId.value = store.availableMachines[0]?.id ?? '';
  selectedDuration.value  = 600;
  showModal.value = true;
}

function createReservation() {
  if (!canCreate.value) return;
  store.createReservation(selectedMachineId.value, selectedDuration.value);
  showModal.value = false;
}

function machineName(nameKey) {
  return t(`machines.names.${nameKey}`) || nameKey;
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('booking.title') }}</h1>
      <p class="page__subtitle">{{ t('booking.subtitle') }}</p>
      <button class="btn btn--accent" @click="openModal">
        <span class="material-icons" style="font-size:16px">add</span>
        {{ t('booking.newBooking') }}
      </button>
    </div>

    <!-- Active reservations -->
    <div v-if="store.reservedMachines.length" class="section">
      <h2 class="section-title">{{ t('booking.timeRemaining') }}</h2>
      <div class="reservation-cards">
        <div v-for="m in store.reservedMachines" :key="m.id" class="card reservation-card">
          <div class="res-icon-wrap">
            <span class="material-icons res-icon">{{ m.icon }}</span>
          </div>
          <div class="res-info">
            <p class="res-name">{{ machineName(m.nameKey) }}</p>
            <p class="res-zone">{{ t(`machines.zones.${gymState.getZoneKey(m.category)}`) }}</p>
          </div>
          <div class="res-timer">
            <span class="timer-val">{{ store.formatTimer(m.timerSeconds ?? 0) }}</span>
            <span class="timer-label">{{ t('booking.timeRemaining') }}</span>
          </div>
          <button class="btn btn--outline btn--sm" @click="store.cancelReservation(m.id)">
            <span class="material-icons" style="font-size:14px">cancel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Expired reservations -->
    <div v-if="store.expiredReservations.length" class="section">
      <h2 class="section-title expired-title">{{ t('booking.expired.title') }}</h2>
      <div class="reservation-cards">
        <div v-for="r in store.expiredReservations" :key="r.machineId" class="card reservation-card reservation-card--expired">
          <div class="res-icon-wrap res-icon-wrap--expired">
            <span class="material-icons res-icon">{{ r.icon }}</span>
          </div>
          <div class="res-info">
            <p class="res-name">{{ machineName(r.nameKey) }}</p>
            <p class="res-zone expired-sub">{{ t('booking.expired.subtitle') }}</p>
          </div>
          <button class="btn btn--outline btn--sm" @click="store.dismissExpiredReservation(r.machineId)">
            <span class="material-icons" style="font-size:14px">close</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state + how-it-works -->
    <div v-if="!store.reservedMachines.length && !store.expiredReservations.length" class="empty-state card">
      <span class="material-icons empty-icon">calendar_month</span>
      <p class="empty-title">{{ t('booking.title') }}</p>
      <p class="empty-sub">{{ t('booking.subtitle') }}</p>
    </div>

    <div class="card how-card">
      <h2 class="how-title">{{ t('booking.how.title') }}</h2>
      <ul class="how-list">
        <li>{{ t('booking.how.item1') }}</li>
        <li>{{ t('booking.how.item2') }}</li>
        <li>{{ t('booking.how.item3') }}</li>
        <li>{{ t('booking.how.item4') }}</li>
      </ul>
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
        <p class="modal-sub">{{ t('booking.modal.subtitle') }}</p>

        <div class="form-field">
          <label>{{ t('booking.modal.machine') }}</label>
          <select v-model="selectedMachineId">
            <option value="" disabled>{{ t('booking.modal.selectMachine') }}</option>
            <option v-for="m in store.availableMachines" :key="m.id" :value="m.id">
              {{ machineName(m.nameKey) }}
            </option>
          </select>
        </div>

        <div class="form-field">
          <label>{{ t('booking.modal.duration') }}</label>
          <div class="duration-options">
            <button v-for="d in DURATIONS" :key="d.value"
              class="btn dur-btn" :class="selectedDuration === d.value ? 'btn--accent' : 'btn--outline'"
              @click="selectedDuration = d.value">
              {{ t(d.label) }}
            </button>
          </div>
        </div>

        <p class="modal-warning">
          <span class="material-icons" style="font-size:16px;color:var(--accent)">info</span>
          {{ t('booking.modal.warning') }}
        </p>

        <div class="modal-footer">
          <button class="btn btn--outline" @click="showModal = false">{{ t('booking.modal.cancel') }}</button>
          <button class="btn btn--accent" :disabled="!canCreate" @click="createReservation">
            {{ t('booking.modal.create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page__subtitle { color: var(--text-secondary); font-size: .85rem; margin-top: .25rem; }
.page__header { align-items: flex-start; display: flex; flex-wrap: wrap; gap: .75rem; justify-content: space-between; margin-bottom: 1.25rem; }
.btn--accent { background: var(--accent); border: none; color: #000; font-weight: 600; }
.btn--accent:disabled { opacity: .5; cursor: default; }
.section { margin-bottom: 1rem; }
.section-title { font-size: .9rem; font-weight: 600; margin-bottom: .75rem; }
.expired-title { color: var(--red); }
.reservation-cards { display: flex; flex-direction: column; gap: .5rem; }
.reservation-card { align-items: center; display: flex; gap: 1rem; padding: .75rem 1rem; }
.reservation-card--expired { opacity: .7; }
.res-icon-wrap { align-items: center; background: rgba(245,188,54,.15); border-radius: 10px; display: flex; height: 44px; justify-content: center; width: 44px; }
.res-icon-wrap--expired { background: rgba(239,68,68,.15); }
.res-icon { color: var(--accent); }
.res-icon-wrap--expired .res-icon { color: var(--red); }
.res-info { flex: 1; }
.res-name { font-size: .88rem; font-weight: 600; }
.res-zone { color: var(--text-secondary); font-size: .75rem; }
.expired-sub { color: var(--red); font-size: .75rem; }
.res-timer { align-items: flex-end; display: flex; flex-direction: column; gap: .1rem; }
.timer-val { color: var(--accent); font-size: 1.1rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.timer-label { color: var(--text-secondary); font-size: .7rem; }
.btn--sm { padding: .25rem .5rem; }
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .5rem; padding: 2.5rem; text-align: center; }
.empty-icon { color: var(--text-secondary); font-size: 48px; }
.empty-title { font-size: .95rem; font-weight: 600; }
.empty-sub { color: var(--text-secondary); font-size: .82rem; }
.how-card { margin-top: 1rem; }
.how-title { font-size: .9rem; font-weight: 600; margin-bottom: .75rem; }
.how-list { color: var(--text-secondary); display: flex; flex-direction: column; font-size: .83rem; gap: .5rem; padding-left: 1.25rem; }
.how-list li::marker { color: var(--accent); }
.modal-overlay { align-items: center; background: rgba(0,0,0,.5); bottom: 0; display: flex; justify-content: center; left: 0; position: fixed; right: 0; top: 0; z-index: 500; }
.modal { max-width: 440px; padding: 1.5rem; width: 90%; }
.modal-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: .5rem; }
.modal-title { font-size: 1rem; font-weight: 700; }
.modal-sub { color: var(--text-secondary); font-size: .82rem; margin-bottom: 1.25rem; }
.close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.form-field { display: flex; flex-direction: column; gap: .4rem; margin-bottom: 1rem; }
.form-field label { font-size: .83rem; color: var(--text-secondary); font-weight: 500; }
.duration-options { display: flex; flex-wrap: wrap; gap: .5rem; }
.dur-btn { font-size: .8rem; padding: .3rem .75rem; }
.modal-warning { align-items: flex-start; background: rgba(245,188,54,.07); border: 1px solid rgba(245,188,54,.2); border-radius: 6px; color: var(--text-secondary); display: flex; font-size: .78rem; gap: .5rem; margin-bottom: 1.25rem; padding: .5rem .75rem; }
.modal-footer { display: flex; gap: .75rem; justify-content: flex-end; }
</style>
