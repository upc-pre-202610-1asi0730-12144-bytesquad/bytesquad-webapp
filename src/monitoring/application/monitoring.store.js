import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SensorApi } from '../infrastructure/sensor-api.js';
import { AnomalyApi } from '../infrastructure/anomaly-api.js';
import { SensorType } from '../domain/model/sensor.entity.js';

const sensorApi  = new SensorApi();
const anomalyApi = new AnomalyApi();

export const useMonitoringStore = defineStore('monitoring', () => {
  const sensors          = ref([]);
  const anomalies        = ref([]);
  const loadingSensors   = ref(false);
  const loadingAnomalies = ref(false);
  const error            = ref(null);

  const motionSensors  = computed(() => sensors.value.filter(s => s.type === SensorType.MOTION));
  const cameraSensors  = computed(() => sensors.value.filter(s => s.type === SensorType.CAMERA));
  const totalSensors   = computed(() => sensors.value.length);
  const totalAnomalies = computed(() => anomalies.value.length);

  async function loadSensors() {
    loadingSensors.value = true;
    error.value = null;
    try {
      sensors.value = await sensorApi.getMySensors();
    } catch (e) {
      error.value = e.message;
    } finally {
      loadingSensors.value = false;
    }
  }

  async function loadAnomalies() {
    loadingAnomalies.value = true;
    try {
      anomalies.value = await anomalyApi.getMyAnomalies();
    } catch (e) {
      error.value = e.message;
    } finally {
      loadingAnomalies.value = false;
    }
  }

  async function registerSensor(type, identifier, equipmentId) {
    const sensor = type === SensorType.MOTION
      ? await sensorApi.registerMotion(identifier, equipmentId || null)
      : await sensorApi.registerCamera(identifier, equipmentId || null);
    sensors.value = [...sensors.value, sensor];
    return sensor;
  }

  async function simulateCapture(sensor) {
    const detectedAt = new Date().toISOString();
    if (sensor.type === SensorType.MOTION) {
      await sensorApi.captureMotion(sensor.id, detectedAt);
    } else {
      await sensorApi.captureCamera(sensor.id, detectedAt);
    }
    sensor.captureCount++;
    sensors.value = [...sensors.value];
  }

  async function reportAnomaly(sensorId, anomalyType, description) {
    const anomaly = await anomalyApi.report(sensorId, anomalyType, description, new Date().toISOString());
    anomalies.value = [anomaly, ...anomalies.value];
    return anomaly;
  }

  loadSensors();
  loadAnomalies();

  return {
    sensors, anomalies, loadingSensors, loadingAnomalies, error,
    motionSensors, cameraSensors, totalSensors, totalAnomalies,
    loadSensors, loadAnomalies, registerSensor, simulateCapture, reportAnomaly,
  };
});
