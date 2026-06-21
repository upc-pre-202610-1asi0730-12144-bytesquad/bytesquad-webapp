<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReservationStore } from '@/reservation/application/reservation.store.js';
import { useEquipmentStore } from '@/equipment/application/equipment.store.js';
import { useAuthStore } from '@/auth/application/auth.store.js';
import { ReservationStatus } from '@/reservation/domain/model/reservation.entity.js';

const { t }       = useI18n();
const store       = useReservationStore();
const equipStore  = useEquipmentStore();
const auth        = useAuthStore();

const showModal  = ref(false);
const form       = ref({ equipmentId: '', startDate: '', endDate: '' });

onMounted(() => store.loadByClient(auth.user?.id));

function openModal() {
  form.value = { equipmentId: '', startDate: '', endDate: '' };
  showModal.value = true;
}

async function createReservation() {
  if (!form.value.equipmentId || !form.value.startDate || !form.value.endDate) return;
  await store.expressCreate(Number(form.value.equipmentId), form.value.startDate, form.value.endDate);
  showModal.value = false;
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
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('booking.title') }}</h1>
      <button class="btn btn--primary" @click="openModal">
        <span class="material-icons" style="font-size:16px">add</span>
        {{ t('booking.newBooking') }}
      </button>
    </div>

    <div v-if="store.loading" class="empty-state card">
      <span class="material-icons empty-icon">hourglass_empty</span>
      <p class="empty-title">{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="!store.reservations.length" class="empty-state card">
      <span class="material-icons empty-icon">calendar_month</span>
      <p class="empty-title">{{ t('booking.empty') }}</p>
    </div>

    <div v-else class="reservation-list">
      <div v-for="r in store.reservations" :key="r.id" class="card reservation-card">
        <div class="res-main">
          <span class="res-eq">{{ eqName(r.equipmentId) }}</span>
          <span class="badge" :class="statusClass(r.status)">{{ r.status }}</span>
        </div>
        <div class="res-dates">
          <span class="material-icons" style="font-size:14px">event</span>
          {{ r.startDate }} → {{ r.endDate }}
          <!-- TODO: live timer not available in entity; startDate/endDate visible -->
        </div>
        <div class="res-actions">
          <button v-if="r.status === ReservationStatus.Initiated"
            class="btn btn--outline btn--sm" @click="store.submitRequest(r.id)">
            {{ t('booking.action.submitRequest') }}
          </button>
          <button v-if="r.status === ReservationStatus.Reserved"
            class="btn btn--outline btn--sm" @click="store.requestEquipmentAvailable(r.id)">
            {{ t('booking.action.requestAvailable') }}
          </button>
          <button v-if="r.status === ReservationStatus.Reserved"
            class="btn btn--primary btn--sm" @click="store.startTimer(r.id)">
            {{ t('booking.action.startTimer') }}
          </button>
          <button v-if="r.status === ReservationStatus.Active"
            class="btn btn--primary btn--sm" @click="store.end(r.id)">
            {{ t('booking.action.end') }}
          </button>
          <button v-if="r.status !== ReservationStatus.Ended && r.status !== ReservationStatus.Cancelled"
            class="btn btn--outline btn--sm btn--danger" @click="store.cancel(r.id)">
            {{ t('booking.action.cancel') }}
          </button>
        </div>
      </div>
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

        <div class="form-field">
          <label>{{ t('booking.modal.machine') }}</label>
          <select v-model="form.equipmentId" required>
            <option value="" disabled>— {{ t('booking.modal.selectMachine') }} —</option>
            <option v-for="eq in equipStore.equipment" :key="eq.id" :value="eq.id">{{ eq.name }}</option>
          </select>
        </div>

        <div class="form-field">
          <label>{{ t('booking.modal.startDate') }}</label>
          <input type="datetime-local" v-model="form.startDate" required />
        </div>

        <div class="form-field">
          <label>{{ t('booking.modal.endDate') }}</label>
          <input type="datetime-local" v-model="form.endDate" required />
        </div>

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
.reservation-list { display: flex; flex-direction: column; gap: .75rem; }
.reservation-card { display: flex; flex-direction: column; gap: .375rem; padding: .875rem 1rem; }
.res-main { align-items: center; display: flex; gap: .75rem; }
.res-eq { font-size: .9rem; font-weight: 600; }
.res-dates { align-items: center; color: var(--text-secondary); display: flex; font-size: .78rem; gap: .35rem; }
.res-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .25rem; }
.btn--sm { font-size: .75rem; padding: .25rem .6rem; }
.btn--danger { border-color: var(--red); color: var(--red); }
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .5rem; padding: 2.5rem; text-align: center; }
.empty-icon { color: var(--text-secondary); font-size: 48px; }
.empty-title { font-size: .95rem; font-weight: 600; }
.modal-overlay { align-items: center; background: rgba(0,0,0,.5); bottom: 0; display: flex; justify-content: center; left: 0; position: fixed; right: 0; top: 0; z-index: 500; }
.modal { max-width: 440px; padding: 1.5rem; width: 90%; }
.modal-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: 1rem; }
.modal-title { font-size: 1rem; font-weight: 700; }
.close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.form-field { display: flex; flex-direction: column; gap: .4rem; margin-bottom: 1rem; }
.form-field label { color: var(--text-secondary); font-size: .83rem; font-weight: 500; }
.error-msg { background: rgba(239,68,68,.1); border: 1px solid var(--red); border-radius: 6px; color: var(--red); font-size: .8rem; margin-bottom: .75rem; padding: .5rem .75rem; }
.modal-footer { display: flex; gap: .75rem; justify-content: flex-end; }
</style>
