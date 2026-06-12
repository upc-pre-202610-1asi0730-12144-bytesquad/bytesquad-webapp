import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { IotApi } from '../infrastructure/iot-api.js';
import { Iot, IotStatus } from '../domain/model/iot.entity.js';

const api = new IotApi();

const FAKE_DEVICES = [
  { id: 1,  equipmentId: 1,  macAddress: 'A4:C3:F0:12:01:AA', status: IotStatus.ONLINE,   lastHeartbeat: '2026-06-12T10:42:00Z', location: 'Zone A — Bay 1',  batteryLevel: 87,  signalStrength: -48, firmwareVersion: 'v2.4.1' },
  { id: 2,  equipmentId: 2,  macAddress: 'A4:C3:F0:12:02:BB', status: IotStatus.ONLINE,   lastHeartbeat: '2026-06-12T10:41:30Z', location: 'Zone A — Bay 2',  batteryLevel: 92,  signalStrength: -44, firmwareVersion: 'v2.4.1' },
  { id: 3,  equipmentId: 3,  macAddress: 'A4:C3:F0:12:03:CC', status: IotStatus.OFFLINE,  lastHeartbeat: '2026-06-11T18:05:00Z', location: 'Zone B — Bay 1',  batteryLevel: 15,  signalStrength: -82, firmwareVersion: 'v2.3.0' },
  { id: 4,  equipmentId: 4,  macAddress: 'A4:C3:F0:12:04:DD', status: IotStatus.ONLINE,   lastHeartbeat: '2026-06-12T10:40:55Z', location: 'Zone B — Bay 2',  batteryLevel: 76,  signalStrength: -53, firmwareVersion: 'v2.4.1' },
  { id: 5,  equipmentId: 5,  macAddress: 'A4:C3:F0:12:05:EE', status: IotStatus.ONLINE,   lastHeartbeat: '2026-06-12T10:42:10Z', location: 'Zone B — Bay 3',  batteryLevel: 63,  signalStrength: -57, firmwareVersion: 'v2.4.0' },
  { id: 6,  equipmentId: 6,  macAddress: 'A4:C3:F0:12:06:FF', status: IotStatus.WARNING,  lastHeartbeat: '2026-06-12T09:58:00Z', location: 'Zone C — Bay 1',  batteryLevel: 22,  signalStrength: -74, firmwareVersion: 'v2.3.2' },
  { id: 7,  equipmentId: 7,  macAddress: 'A4:C3:F0:12:07:11', status: IotStatus.OFFLINE,  lastHeartbeat: '2026-06-11T22:30:00Z', location: 'Zone C — Bay 2',  batteryLevel: 8,   signalStrength: -88, firmwareVersion: 'v2.2.5' },
  { id: 8,  equipmentId: 8,  macAddress: 'A4:C3:F0:12:08:22', status: IotStatus.ONLINE,   lastHeartbeat: '2026-06-12T10:43:00Z', location: 'Zone C — Bay 3',  batteryLevel: 95,  signalStrength: -41, firmwareVersion: 'v2.4.1' },
  { id: 9,  equipmentId: 9,  macAddress: 'A4:C3:F0:12:09:33', status: IotStatus.ONLINE,   lastHeartbeat: '2026-06-12T10:39:45Z', location: 'Zone D — Bay 1',  batteryLevel: 54,  signalStrength: -61, firmwareVersion: 'v2.4.0' },
  { id: 10, equipmentId: 10, macAddress: 'A4:C3:F0:12:0A:44', status: IotStatus.ONLINE,   lastHeartbeat: '2026-06-12T10:41:00Z', location: 'Zone D — Bay 2',  batteryLevel: 78,  signalStrength: -50, firmwareVersion: 'v2.4.1' },
  { id: 11, equipmentId: 12, macAddress: 'A4:C3:F0:12:0B:55', status: IotStatus.ONLINE,   lastHeartbeat: '2026-06-12T10:40:20Z', location: 'Zone A — Bay 3',  batteryLevel: 69,  signalStrength: -55, firmwareVersion: 'v2.3.2' },
  { id: 12, equipmentId: 14, macAddress: 'A4:C3:F0:12:0C:66', status: IotStatus.ONLINE,   lastHeartbeat: '2026-06-12T10:42:50Z', location: 'Zone B — Bay 4',  batteryLevel: 84,  signalStrength: -46, firmwareVersion: 'v2.4.1' },
].map(d => new Iot(d));

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
      const result = next.length ? next : FAKE_DEVICES;
      detectReconnections(prev, result);
      devices.value = result;
    } catch {
      devices.value = FAKE_DEVICES;
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
