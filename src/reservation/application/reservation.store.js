import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ReservationApi } from '../infrastructure/reservation-api.js';
import { ReservationStatus } from '../domain/model/reservation.entity.js';
import { useAuthStore } from '@/auth/application/auth.store.js';

const api = new ReservationApi();

export const useReservationStore = defineStore('reservation', () => {
  // TODO: wire when backend adds GET /reservations (get-all)
  const reservations = ref([]);
  const loading      = ref(false);
  const error        = ref(null);

  const activeReservations    = computed(() => reservations.value.filter(r => r.status === ReservationStatus.Active));
  const initiatedReservations = computed(() => reservations.value.filter(r => r.status === ReservationStatus.Initiated));
  const reservedReservations  = computed(() => reservations.value.filter(r => r.status === ReservationStatus.Reserved));
  const endedReservations     = computed(() => reservations.value.filter(r => r.status === ReservationStatus.Ended));

  function _upsert(updated) {
    const idx = reservations.value.findIndex(r => r.id === updated.id);
    if (idx >= 0) reservations.value = reservations.value.map(r => r.id === updated.id ? updated : r);
    else reservations.value = [updated, ...reservations.value];
  }

  async function loadByClient(clientId) {
    if (!clientId) return;
    loading.value = true; error.value = null;
    try {
      reservations.value = await api.getByClient(clientId);
    } catch (e) {
      error.value = e.message || 'Failed to load reservations';
    } finally { loading.value = false; }
  }

  async function expressCreate(equipmentId, startDate, endDate) {
    const auth = useAuthStore();
    if (!auth.user?.id) return;
    loading.value = true; error.value = null;
    try {
      const created = await api.expressCreate(auth.user.id, equipmentId, startDate, endDate);
      _upsert(created);
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create reservation';
    } finally { loading.value = false; }
  }

  async function submitRequest(id) {
    try {
      _upsert(await api.submitRequest(id));
    } catch (e) { error.value = e.message; }
  }

  async function requestEquipmentAvailable(id) {
    try {
      _upsert(await api.requestEquipmentAvailable(id));
    } catch (e) { error.value = e.message; }
  }

  async function startTimer(id) {
    try {
      _upsert(await api.startTimer(id));
    } catch (e) { error.value = e.message; }
  }

  async function end(id) {
    try {
      _upsert(await api.end(id));
    } catch (e) { error.value = e.message; }
  }

  async function cancel(id) {
    try {
      _upsert(await api.cancel(id));
    } catch (e) { error.value = e.message; }
  }

  return {
    reservations, loading, error,
    activeReservations, initiatedReservations, reservedReservations, endedReservations,
    loadByClient, expressCreate, submitRequest, requestEquipmentAvailable, startTimer, end, cancel,
  };
});
