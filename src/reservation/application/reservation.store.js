import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ReservationApi } from '../infrastructure/reservation-api.js';
import { ReservationStatus } from '../domain/model/reservation.entity.js';
import { useProfilesStore } from '@/profiles/application/profiles.store.js';

const api = new ReservationApi();

export const useReservationStore = defineStore('reservation', () => {
  // TODO: wire when backend adds GET /reservations (get-all)
  const reservations = ref([]);
  const loading      = ref(false);
  const error        = ref(null);
  const usageCounts  = ref({});

  const activeReservations    = computed(() => reservations.value.filter(r => r.status === ReservationStatus.Active));
  const initiatedReservations = computed(() => reservations.value.filter(r => r.status === ReservationStatus.Initiated));
  const reservedReservations  = computed(() => reservations.value.filter(r => r.status === ReservationStatus.Reserved));
  const endedReservations     = computed(() => reservations.value.filter(r => r.status === ReservationStatus.Ended));
  const historyReservations   = computed(() => reservations.value.filter(
    r => r.status === ReservationStatus.Ended || r.status === ReservationStatus.Cancelled));
  const hasOpenReservation    = computed(() => reservations.value.some(
    r => r.status !== ReservationStatus.Ended && r.status !== ReservationStatus.Cancelled));

  function _upsert(updated) {
    const idx = reservations.value.findIndex(r => r.id === updated.id);
    if (idx >= 0) reservations.value = reservations.value.map(r => r.id === updated.id ? updated : r);
    else reservations.value = [updated, ...reservations.value];
  }

  // The backend identifies a client by their Profiles Client.Id, not their IAM user id.
  async function _resolveClientId() {
    const profilesStore = useProfilesStore();
    if (!profilesStore.myProfile) await profilesStore.loadMyProfile();
    return profilesStore.myProfile?.id ?? null;
  }

  async function loadMine() {
    const clientId = await _resolveClientId();
    if (!clientId) return;
    loading.value = true; error.value = null;
    try {
      reservations.value = await api.getByClient(clientId);
    } catch (e) {
      error.value = e.message || 'Failed to load reservations';
    } finally { loading.value = false; }
  }

  // Same as loadMine(), but without toggling loading/error — for background polling
  // that picks up server-side changes (e.g. the auto-end-on-expiry job) without
  // flashing the loading state on an already-visible list.
  async function refreshMine() {
    const clientId = await _resolveClientId();
    if (!clientId) return;
    try {
      reservations.value = await api.getByClient(clientId);
    } catch {
      // Silent: this is a background refresh, the last known state stays on screen.
    }
  }

  async function expressCreate(equipmentId, startDate, endDate) {
    const clientId = await _resolveClientId();
    if (!clientId) return;
    loading.value = true; error.value = null;
    try {
      const created = await api.expressCreate(clientId, equipmentId, startDate, endDate);
      _upsert(created);
      return created;
    } catch (e) {
      if (e.status === 400 && (e.message === 'GymMembershipInactive' || e.apiError?.error === 'GymMembershipInactive')) {
        error.value = 'Your gym membership is not active. Activate it to make reservations.';
      } else {
        error.value = e.message || 'Failed to create reservation';
      }
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

  async function startTimer(id, durationMinutes) {
    try {
      _upsert(await api.startTimer(id, durationMinutes));
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

  // Historical reservation count per equipment id, used for the map's heatmap view.
  async function loadUsageCounts(equipmentIds) {
    const entries = await Promise.all(equipmentIds.map(async id => {
      try {
        const list = await api.getByEquipment(id);
        return [id, list.length];
      } catch {
        return [id, 0];
      }
    }));
    usageCounts.value = Object.fromEntries(entries);
  }

  return {
    reservations, loading, error, usageCounts,
    activeReservations, initiatedReservations, reservedReservations, endedReservations,
    historyReservations, hasOpenReservation,
    loadMine, refreshMine, expressCreate, submitRequest, requestEquipmentAvailable, startTimer, end, cancel,
    loadUsageCounts,
  };
});
