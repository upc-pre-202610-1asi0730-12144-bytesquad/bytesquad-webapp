import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { gymState } from '@/shared/application/gym-state.service.js';
import { useAlertsStore } from '@/monitoring/application/alerts.service.js';

export const useReservationStore = defineStore('reservation', () => {
  const expiredReservations = ref([]);

  const reservedMachines  = computed(() => gymState.machines.value.filter(m => m.status === 'RESERVED'));
  const availableMachines = computed(() => gymState.machines.value.filter(m => m.status === 'AVAILABLE'));

  setInterval(() => {
    const alerts = useAlertsStore();
    const expired = gymState.tickReservedMachines();
    if (expired.length > 0) {
      expiredReservations.value = [...expiredReservations.value, ...expired];
      expired.forEach(e => alerts.addReservationExpiredAlert(e.nameKey));
    }
  }, 1000);

  function createReservation(machineId, durationSeconds) {
    gymState.setMachineAsReserved(machineId, durationSeconds);
  }

  function cancelReservation(machineId) {
    gymState.setMachineAsAvailable(machineId);
    expiredReservations.value = expiredReservations.value.filter(r => r.machineId !== machineId);
  }

  function dismissExpiredReservation(machineId) {
    expiredReservations.value = expiredReservations.value.filter(r => r.machineId !== machineId);
  }

  function formatTimer(seconds) { return gymState.formatTimer(seconds); }
  function getZoneKey(category) { return gymState.getZoneKey(category); }

  return { expiredReservations, reservedMachines, availableMachines, createReservation, cancelReservation, dismissExpiredReservation, formatTimer, getZoneKey };
});
