import { defineStore } from 'pinia';
import { ref } from 'vue';

let _nextId = 4;

export const useAlertsStore = defineStore('alerts', () => {
  const alerts = ref([
    { id: 1, type: 'admin',  icon: 'warning',   title: 'alerts.seeded.alr001.title', description: 'alerts.seeded.alr001.description', timestamp: new Date(Date.now() - 5  * 60000),    read: { admin: false, client: false }, link: '/iot' },
    { id: 2, type: 'system', icon: 'wifi_off',  title: 'alerts.seeded.alr002.title', description: 'alerts.seeded.alr002.description', timestamp: new Date(Date.now() - 30 * 60000),   read: { admin: false, client: false }, link: null },
    { id: 3, type: 'client', icon: 'person',    title: 'alerts.seeded.alr003.title', description: 'alerts.seeded.alr003.description', timestamp: new Date(Date.now() - 2  * 3600000), read: { admin: false, client: false }, link: '/bookings' },
  ]);

  function addReservationExpiredAlert(machineNameKey) {
    alerts.value.unshift({
      id: _nextId++,
      type: 'client',
      icon: 'timer_off',
      title: 'alerts.reservationExpired.title',
      description: 'machines.names.' + machineNameKey,
      timestamp: new Date(),
      read: { admin: false, client: false },
      link: '/bookings',
    });
  }

  function deleteAlert(id) {
    alerts.value = alerts.value.filter(a => a.id !== id);
  }

  function markReadForRole(role) {
    alerts.value = alerts.value.map(a => ({
      ...a, read: { ...a.read, [role]: true },
    }));
  }

  return { alerts, addReservationExpiredAlert, deleteAlert, markReadForRole };
});
