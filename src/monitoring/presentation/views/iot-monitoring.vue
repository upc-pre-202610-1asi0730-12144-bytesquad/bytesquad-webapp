<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMonitoringStore } from '@/monitoring/application/monitoring.store.js';
import { SensorType } from '@/monitoring/domain/model/sensor.entity.js';

const { t } = useI18n();
const store = useMonitoringStore();

const search        = ref('');
const filterType    = ref('');
const showRegister  = ref(false);
const showAnomaly   = ref(false);

const regType       = ref(SensorType.MOTION);
const regIdentifier = ref('');
const regEquipment  = ref('');
const regSubmitting = ref(false);
const regError      = ref('');

const anSensorId    = ref('');
const anType        = ref('');
const anDescription = ref('');
const anSubmitting  = ref(false);
const anError       = ref('');

const filteredSensors = computed(() => {
  let list = store.sensors;
  const q = search.value.toLowerCase().trim();
  if (q)              list = list.filter(s => s.identifier.toLowerCase().includes(q));
  if (filterType.value) list = list.filter(s => s.type === filterType.value);
  return list;
});

function sensorLabel(s) { return `${s.identifier} (${t('iot.sensors.types.' + s.type)})`; }
function typeIcon(type)  { return type === SensorType.MOTION ? 'sensors' : 'videocam'; }
function fmtDate(iso)    { return iso ? new Date(iso).toLocaleDateString() : '—'; }

function openRegister() { regIdentifier.value = ''; regEquipment.value = ''; regError.value = ''; showRegister.value = true; }

async function submitRegister() {
  if (!regIdentifier.value.trim()) { regError.value = t('iot.sensors.form.identifierRequired'); return; }
  regSubmitting.value = true; regError.value = '';
  try {
    await store.registerSensor(regType.value, regIdentifier.value.trim(), regEquipment.value.trim() || null);
    showRegister.value = false;
  } catch (e) {
    regError.value = e.message;
  } finally {
    regSubmitting.value = false;
  }
}

function openAnomaly() { anSensorId.value = store.sensors[0]?.id ?? ''; anType.value = ''; anDescription.value = ''; anError.value = ''; showAnomaly.value = true; }

async function submitAnomaly() {
  if (!anSensorId.value || !anType.value.trim() || !anDescription.value.trim()) {
    anError.value = t('iot.anomalies.form.allRequired'); return;
  }
  anSubmitting.value = true; anError.value = '';
  try {
    await store.reportAnomaly(Number(anSensorId.value), anType.value.trim(), anDescription.value.trim());
    showAnomaly.value = false;
  } catch (e) {
    anError.value = e.message;
  } finally {
    anSubmitting.value = false;
  }
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('iot.title') }}</h1>
      <button class="btn btn--outline" @click="store.loadSensors(); store.loadAnomalies()">
        <span class="material-icons" style="font-size:16px">refresh</span> {{ t('iot.actions.refresh') }}
      </button>
    </div>

    <!-- KPI row -->
    <div class="kpi-row">
      <div class="kpi-card card">
        <span class="material-icons kpi-icon" style="color:var(--accent)">device_hub</span>
        <div><p class="kpi-label">{{ t('iot.stats.total') }}</p><p class="kpi-val">{{ store.totalSensors }}</p></div>
      </div>
      <div class="kpi-card card">
        <span class="material-icons kpi-icon" style="color:var(--green)">sensors</span>
        <div><p class="kpi-label">{{ t('iot.stats.motion') }}</p><p class="kpi-val">{{ store.motionSensors.length }}</p></div>
      </div>
      <div class="kpi-card card">
        <span class="material-icons kpi-icon" style="color:var(--green)">videocam</span>
        <div><p class="kpi-label">{{ t('iot.stats.camera') }}</p><p class="kpi-val">{{ store.cameraSensors.length }}</p></div>
      </div>
      <div class="kpi-card card">
        <span class="material-icons kpi-icon" style="color:var(--red)">warning</span>
        <div><p class="kpi-label">{{ t('iot.stats.anomalies') }}</p><p class="kpi-val kpi-val--red">{{ store.totalAnomalies }}</p></div>
      </div>
    </div>

    <!-- Sensors section -->
    <div class="section-header">
      <h2 class="section-title">{{ t('iot.sensors.title') }}</h2>
      <button class="btn btn--primary" @click="openRegister()">
        <span class="material-icons" style="font-size:16px">add</span> {{ t('iot.sensors.register') }}
      </button>
    </div>

    <div class="filters card">
      <input v-model="search" :placeholder="t('iot.search')" style="flex:1" />
      <select v-model="filterType">
        <option value="">{{ t('iot.filter.allTypes') }}</option>
        <option :value="SensorType.MOTION">{{ t('iot.sensors.types.MotionSensor') }}</option>
        <option :value="SensorType.CAMERA">{{ t('iot.sensors.types.CameraSensor') }}</option>
      </select>
    </div>

    <div class="card" style="padding:0;overflow:hidden;margin-bottom:1.5rem">
      <div v-if="store.loadingSensors" class="table-empty">
        <span class="material-icons spin">refresh</span>
      </div>
      <table v-else class="data-table">
        <thead><tr>
          <th>{{ t('iot.sensors.type') }}</th>
          <th>{{ t('iot.sensors.identifier') }}</th>
          <th>{{ t('iot.sensors.equipmentId') }}</th>
          <th>{{ t('iot.sensors.captureCount') }}</th>
          <th>{{ t('iot.sensors.registeredAt') }}</th>
          <th></th>
        </tr></thead>
        <tbody>
          <tr v-if="!filteredSensors.length">
            <td colspan="6" class="table-empty">{{ t('iot.sensors.noData') }}</td>
          </tr>
          <tr v-for="s in filteredSensors" :key="s.id">
            <td>
              <span class="type-chip" :class="s.type === SensorType.MOTION ? 'type-chip--motion' : 'type-chip--camera'">
                <span class="material-icons" style="font-size:14px">{{ typeIcon(s.type) }}</span>
                {{ t('iot.sensors.types.' + s.type) }}
              </span>
            </td>
            <td class="cell-id">{{ s.identifier }}</td>
            <td style="color:var(--text-secondary)">{{ s.equipmentId ?? '—' }}</td>
            <td>{{ s.captureCount }}</td>
            <td style="font-size:0.75rem;color:var(--text-secondary)">{{ fmtDate(s.registeredAt) }}</td>
            <td>
              <button class="btn btn--outline" style="font-size:0.72rem;padding:2px 8px" @click="store.simulateCapture(s)">
                <span class="material-icons" style="font-size:13px">play_arrow</span> {{ t('iot.sensors.simulate') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Anomalies section -->
    <div class="section-header">
      <h2 class="section-title">{{ t('iot.anomalies.title') }}</h2>
      <button class="btn btn--danger" style="font-size:0.8rem" @click="openAnomaly()" :disabled="!store.sensors.length">
        <span class="material-icons" style="font-size:16px">add_alert</span> {{ t('iot.anomalies.report') }}
      </button>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div v-if="store.loadingAnomalies" class="table-empty">
        <span class="material-icons spin">refresh</span>
      </div>
      <table v-else class="data-table">
        <thead><tr>
          <th>{{ t('iot.anomalies.type') }}</th>
          <th>{{ t('iot.anomalies.description') }}</th>
          <th>{{ t('iot.anomalies.sensor') }}</th>
          <th>{{ t('iot.anomalies.detectedAt') }}</th>
        </tr></thead>
        <tbody>
          <tr v-if="!store.anomalies.length">
            <td colspan="4" class="table-empty">{{ t('iot.anomalies.noData') }}</td>
          </tr>
          <tr v-for="a in store.anomalies" :key="a.id">
            <td><span class="anomaly-type-chip">{{ a.anomalyType }}</span></td>
            <td style="font-size:0.8rem">{{ a.description }}</td>
            <td class="cell-id">{{ a.sensorId }}</td>
            <td style="font-size:0.75rem;color:var(--text-secondary)">{{ fmtDate(a.detectedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Register Sensor modal -->
    <div v-if="showRegister" class="modal-backdrop" @click.self="showRegister = false">
      <div class="modal card">
        <h2 class="modal-title">{{ t('iot.sensors.form.title') }}</h2>
        <div class="form-field">
          <label>{{ t('iot.sensors.type') }}</label>
          <select v-model="regType">
            <option :value="SensorType.MOTION">{{ t('iot.sensors.types.MotionSensor') }}</option>
            <option :value="SensorType.CAMERA">{{ t('iot.sensors.types.CameraSensor') }}</option>
          </select>
        </div>
        <div class="form-field">
          <label>{{ t('iot.sensors.identifier') }}</label>
          <input v-model="regIdentifier" :placeholder="t('iot.sensors.form.identifierPlaceholder')" />
        </div>
        <div class="form-field">
          <label>{{ t('iot.sensors.equipmentId') }} <span style="color:var(--text-secondary)">({{ t('iot.sensors.form.optional') }})</span></label>
          <input v-model="regEquipment" :placeholder="t('iot.sensors.form.equipmentIdPlaceholder')" type="number" />
        </div>
        <p v-if="regError" class="form-error">{{ regError }}</p>
        <div class="modal-actions">
          <button class="btn btn--outline" @click="showRegister = false">{{ t('iot.actions.cancel') }}</button>
          <button class="btn btn--primary" :disabled="regSubmitting" @click="submitRegister()">
            {{ regSubmitting ? '…' : t('iot.sensors.form.submit') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Report Anomaly modal -->
    <div v-if="showAnomaly" class="modal-backdrop" @click.self="showAnomaly = false">
      <div class="modal card">
        <h2 class="modal-title">{{ t('iot.anomalies.form.title') }}</h2>
        <div class="form-field">
          <label>{{ t('iot.anomalies.sensor') }}</label>
          <select v-model="anSensorId">
            <option v-for="s in store.sensors" :key="s.id" :value="s.id">{{ sensorLabel(s) }}</option>
          </select>
        </div>
        <div class="form-field">
          <label>{{ t('iot.anomalies.type') }}</label>
          <input v-model="anType" :placeholder="t('iot.anomalies.form.typePlaceholder')" />
        </div>
        <div class="form-field">
          <label>{{ t('iot.anomalies.description') }}</label>
          <textarea v-model="anDescription" :placeholder="t('iot.anomalies.form.descriptionPlaceholder')" rows="3" style="resize:vertical"></textarea>
        </div>
        <p v-if="anError" class="form-error">{{ anError }}</p>
        <div class="modal-actions">
          <button class="btn btn--outline" @click="showAnomaly = false">{{ t('iot.actions.cancel') }}</button>
          <button class="btn btn--danger" :disabled="anSubmitting" @click="submitAnomaly()">
            {{ anSubmitting ? '…' : t('iot.anomalies.form.submit') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kpi-row         { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); margin-bottom: 1rem; }
.kpi-card        { align-items: center; display: flex; gap: 1rem; }
.kpi-icon        { font-size: 2rem; }
.kpi-label       { color: var(--text-secondary); font-size: 0.8rem; }
.kpi-val         { font-size: 1.75rem; font-weight: 700; }
.kpi-val--red    { color: var(--red); }

.section-header  { align-items: center; display: flex; justify-content: space-between; margin-bottom: .5rem; margin-top: 1.5rem; }
.section-title   { font-size: 0.9rem; font-weight: 600; }

.filters         { display: flex; gap: .75rem; margin-bottom: 1rem; }

.data-table      { border-collapse: collapse; font-size: 0.82rem; width: 100%; }
.data-table th   { background: var(--bg-surface); border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 500; padding: .5rem .75rem; text-align: left; }
.data-table td   { border-bottom: 1px solid rgba(255,255,255,.04); padding: .5rem .75rem; }
.cell-id         { color: var(--accent); font-family: monospace; }
.table-empty     { color: var(--text-secondary); padding: 1.5rem; text-align: center; }

.type-chip         { align-items: center; border-radius: 999px; display: inline-flex; font-size: 0.72rem; font-weight: 600; gap: 3px; padding: 2px 8px; }
.type-chip--motion { background: rgba(99,102,241,.15); color: #818cf8; }
.type-chip--camera { background: rgba(20,184,166,.15); color: #2dd4bf; }
.anomaly-type-chip { background: rgba(239,68,68,.12); border-radius: 4px; color: var(--red); font-family: monospace; font-size: 0.72rem; padding: 1px 6px; }

.modal-backdrop  { align-items: center; background: rgba(0,0,0,.6); bottom: 0; display: flex; justify-content: center; left: 0; position: fixed; right: 0; top: 0; z-index: 400; }
.modal           { display: flex; flex-direction: column; gap: .75rem; max-width: 380px; padding: 1.75rem; width: 100%; }
.modal-title     { font-size: 1rem; font-weight: 600; margin-bottom: .25rem; }
.modal-actions   { display: flex; gap: .5rem; justify-content: flex-end; margin-top: .25rem; }
.form-field      { display: flex; flex-direction: column; gap: .3rem; }
.form-field label { color: var(--text-secondary); font-size: 0.78rem; font-weight: 500; }
.form-field input,
.form-field select,
.form-field textarea { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); font-size: 0.85rem; padding: .45rem .6rem; width: 100%; }
.form-error      { color: var(--red); font-size: 0.78rem; }

.spin { animation: spin .8s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
</style>
