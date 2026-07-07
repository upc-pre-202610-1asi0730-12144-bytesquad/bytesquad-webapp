import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { IotApi } from '../infrastructure/iot-api.js';
import { IotStatus } from '../domain/model/iot.entity.js';

const api = new IotApi();

export const useIotStore = defineStore('iot', () => {
  const devices           = ref([]);
  const loading           = ref(false);
  const error             = ref(null);
  const reconnectedDevice = ref(null);
  const dismissedAlertIds = ref(new Set());

  const deviceCount  = computed(() => devices.value.length);
  const onlineCount  = computed(() => devices.value.filter(d => d.status === IotStatus.ONLINE).length);
  const offlineCount = computed(() => devices.value.filter(d => d.status === IotStatus.OFFLINE).length);
  const avgBattery   = computed(() => {
    if (!devices.value.length) return 0;
    return Math.round(devices.value.reduce((s, d) => s + d.batteryLevel, 0) / devices.value.length);
  });
  const activeAlerts = computed(() =>
    devices.value.filter(d => !dismissedAlertIds.value.has(d.id) && d.status === IotStatus.OFFLINE));

  async function loadDevices() {
    const prev = [...devices.value];
    loading.value = true; error.value = null;
    try {
      const next = await api.getDevices();
      detectReconnections(prev, next);
      devices.value = next;
    } catch (e) {
      error.value = e.message || 'Failed to load sensors';
    } finally { loading.value = false; }
  }

  function detectReconnections(prev, next) {
    const r = next.find(n =>
      n.status === IotStatus.ONLINE &&
      prev.some(p => p.id === n.id && p.status === IotStatus.OFFLINE));
    if (r) reconnectedDevice.value = r;
  }

  async function registerSensor(data) {
    loading.value = true; error.value = null;
    try {
      const created = await api.registerDevice(data);
      devices.value = [...devices.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to register sensor';
    } finally { loading.value = false; }
  }

  // Lets the admin manually force an early reconnection instead of waiting for it to happen on its own.
  async function investigateAlert(sensor) {
    try {
      const updated = await api.markReconnected(sensor.id);
      devices.value = devices.value.map(d => d.id === updated.id ? updated : d);
      reconnectedDevice.value = updated;
    } catch (e) {
      error.value = e.message || 'Failed to reconnect sensor';
    }
  }

  function scheduleReplacement(sensorId) {
    dismissedAlertIds.value = new Set([...dismissedAlertIds.value, sensorId]);
  }

  function dismissReconnectedModal() { reconnectedDevice.value = null; }

  return {
    devices, loading, error, reconnectedDevice,
    deviceCount, onlineCount, offlineCount, avgBattery, activeAlerts,
    loadDevices, registerSensor, investigateAlert, scheduleReplacement, dismissReconnectedModal,
  };
});
