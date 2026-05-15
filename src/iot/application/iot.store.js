import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { IotApi } from '../infrastructure/iot-api.js';
import { IotStatus } from '../domain/model/iot.entity.js';

const api = new IotApi();

export const useIotStore = defineStore('iot', () => {
  const devices            = ref([]);
  const loading            = ref(false);
  const error              = ref(null);
  const reconnectedDevice  = ref(null);
  const dismissedAlertIds  = ref(new Set());

  const deviceCount  = computed(() => devices.value.length);
  const onlineCount  = computed(() => devices.value.filter(d => d.status === IotStatus.ONLINE).length);
  const offlineCount = computed(() => devices.value.filter(d => d.status === IotStatus.OFFLINE).length);
  const warningCount = computed(() => devices.value.filter(d => d.status === IotStatus.WARNING).length);
  const avgBattery   = computed(() => {
    if (!devices.value.length) return 0;
    return Math.round(devices.value.reduce((s, d) => s + d.batteryLevel, 0) / devices.value.length);
  });
  const activeAlerts = computed(() =>
    devices.value.filter(d =>
      !dismissedAlertIds.value.has(d.id) &&
      (d.status === IotStatus.OFFLINE || d.status === IotStatus.WARNING)
    )
  );

  async function loadDevices() {
    const prev = [...devices.value];
    loading.value = true; error.value = null;
    try {
      const next = await api.getDevices();
      detectReconnections(prev, next);
      devices.value = next;
    } catch (e) {
      error.value = e.message || 'Failed to load devices';
    } finally { loading.value = false; }
  }

  function detectReconnections(prev, next) {
    const r = next.find(n =>
      n.status === IotStatus.ONLINE &&
      prev.some(p => p.id === n.id && p.status === IotStatus.OFFLINE)
    );
    if (r) reconnectedDevice.value = r;
  }

  function investigateAlert(sensor) {
    sensor.status = IotStatus.ONLINE;
    devices.value = [...devices.value];
    reconnectedDevice.value = sensor;
  }

  function scheduleReplacement(sensorId) {
    dismissedAlertIds.value = new Set([...dismissedAlertIds.value, sensorId]);
  }

  function dismissReconnectedModal() { reconnectedDevice.value = null; }

  loadDevices();

  return { devices, loading, error, reconnectedDevice, deviceCount, onlineCount, offlineCount, warningCount, avgBattery, activeAlerts, loadDevices, investigateAlert, scheduleReplacement, dismissReconnectedModal };
});
