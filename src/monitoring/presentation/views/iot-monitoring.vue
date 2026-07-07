<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useIotStore } from '@/monitoring/application/iot.store.js';
import { IotStatus } from '@/monitoring/domain/model/iot.entity.js';
import { useAuthStore } from '@/authentication/application/auth.store.js';
import { GymApi } from '@/gym/infrastructure/gym-api.js';

const { t } = useI18n();
const store = useIotStore();
const auth  = useAuthStore();
const gymApi = new GymApi();

const search        = ref('');
const filterStatus  = ref('');
const showRegister  = ref(false);
const equipmentOptions = ref([]);
const zoneOptions      = ref([]);
const form = ref({ equipmentId: '', macAddress: '', location: '', batteryLevel: 100, signalStrength: -50, firmwareVersion: 'v1.0.0' });
const registerError = ref(null);

// The sensor's location is derived from the zone of whichever equipment it's linked to.
watch(() => form.value.equipmentId, (equipmentId) => {
  const eq = equipmentOptions.value.find(e => e.id === equipmentId);
  const zone = eq ? zoneOptions.value.find(z => z.id === eq.zoneId) : null;
  form.value.location = zone?.name ?? '';
});

const filteredDevices = computed(() => {
  let list = store.devices;
  const q = search.value.toLowerCase().trim();
  if (q) list = list.filter(d => d.location.toLowerCase().includes(q) || d.macAddress.toLowerCase().includes(q));
  if (filterStatus.value) list = list.filter(d => d.status === filterStatus.value);
  return list;
});

function sensorId(d)    { return `SEN-${String(d.id).padStart(3, '0')}`; }
function statusIcon(s)  { return s === IotStatus.ONLINE ? 'wifi' : 'wifi_off'; }
function statusClass(s) { return s === IotStatus.ONLINE ? 'green' : 'red'; }
function batteryIcon(b) { return b > 60 ? 'battery_full' : b > 20 ? 'battery_3_bar' : 'battery_alert'; }
function batteryClass(b){ return b > 60 ? 'green' : b > 20 ? 'amber' : 'red'; }

async function loadEquipmentOptions() {
  const gym = await gymApi.getByAdmin(auth.user.id);
  if (!gym) return;
  equipmentOptions.value = await gymApi.getEquipmentsByGymId(gym.id);
  zoneOptions.value = await gymApi.getZonesByGymId(gym.id);
}

function openRegister() {
  form.value = { equipmentId: '', macAddress: '', location: '', batteryLevel: 100, signalStrength: -50, firmwareVersion: 'v1.0.0' };
  registerError.value = null;
  showRegister.value = true;
}

async function submitRegister() {
  if (!form.value.equipmentId || !form.value.macAddress || !form.value.location) return;
  const created = await store.registerSensor({
    ...form.value,
    equipmentId: Number(form.value.equipmentId),
    batteryLevel: Number(form.value.batteryLevel),
    signalStrength: Number(form.value.signalStrength),
  });
  if (created) showRegister.value = false;
  else registerError.value = store.error;
}

let refreshTimer;
onMounted(() => {
  store.loadDevices();
  loadEquipmentOptions();
  refreshTimer = setInterval(() => store.loadDevices(), 15000);
});
onUnmounted(() => clearInterval(refreshTimer));
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('iot.title') }}</h1>
      <div style="display:flex; gap:.5rem">
        <button class="btn btn--primary" @click="openRegister">
          <span class="material-icons" style="font-size:16px">add</span> {{ t('iot.actions.register') }}
        </button>
        <button class="btn btn--outline" @click="store.loadDevices()"><span class="material-icons" style="font-size:16px">refresh</span> {{ t('iot.actions.refresh') }}</button>
      </div>
    </div>

    <div class="kpi-row">
      <div class="kpi-card card"><span class="material-icons kpi-icon" style="color:var(--green)">wifi</span><div><p class="kpi-label">{{ t('iot.stats.online') }}</p><p class="kpi-val">{{ store.onlineCount }}</p></div></div>
      <div class="kpi-card card"><span class="material-icons kpi-icon" style="color:var(--red)">wifi_off</span><div><p class="kpi-label">{{ t('iot.stats.offline') }}</p><p class="kpi-val kpi-val--red">{{ store.offlineCount }}</p></div></div>
      <div class="kpi-card card"><span class="material-icons kpi-icon" style="color:var(--accent)">battery_3_bar</span><div><p class="kpi-label">{{ t('iot.stats.avgBattery') }}</p><p class="kpi-val">{{ store.avgBattery }}%</p></div></div>
      <div class="kpi-card card"><span class="material-icons kpi-icon" style="color:var(--red)">notifications_active</span><div><p class="kpi-label">{{ t('iot.stats.activeAlerts') }}</p><p class="kpi-val kpi-val--red">{{ store.activeAlerts.length }}</p></div></div>
    </div>

    <div class="filters card">
      <input v-model="search" :placeholder="t('iot.search')" style="flex:1" />
      <select v-model="filterStatus">
        <option value="">{{ t('iot.filter.allStatuses') }}</option>
        <option v-for="s in Object.values(IotStatus)" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <table class="data-table">
        <thead><tr>
          <th>{{ t('iot.table.id') }}</th><th>{{ t('iot.table.location') }}</th>
          <th>{{ t('iot.table.status') }}</th><th>{{ t('iot.table.battery') }}</th>
          <th>{{ t('iot.table.signal') }}</th><th>{{ t('iot.table.firmware') }}</th>
          <th>{{ t('iot.table.lastPing') }}</th>
        </tr></thead>
        <tbody>
          <tr v-if="!filteredDevices.length"><td colspan="7" class="table-empty">{{ t('iot.table.noData') }}</td></tr>
          <tr v-for="d in filteredDevices" :key="d.id">
            <td class="cell-id">{{ sensorId(d) }}</td>
            <td>{{ d.location }}</td>
            <td><span class="status-chip" :class="`status-chip--${statusClass(d.status)}`"><span class="material-icons" style="font-size:14px">{{ statusIcon(d.status) }}</span> {{ t('iot.status.' + d.status) }}</span></td>
            <td><span :class="`bat-${batteryClass(d.batteryLevel)}`"><span class="material-icons" style="font-size:14px">{{ batteryIcon(d.batteryLevel) }}</span> {{ d.batteryLevel }}%</span></td>
            <td>{{ d.signalStrength }} dBm</td>
            <td>{{ d.firmwareVersion }}</td>
            <td style="font-size:0.75rem;color:var(--text-secondary)">{{ d.lastHeartbeat }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="store.activeAlerts.length" class="alerts-card card">
      <h2 class="chart-title">{{ t('iot.alerts.title') }}</h2>
      <div v-for="d in store.activeAlerts" :key="d.id" class="alert-row">
        <span class="material-icons" style="color:var(--red)">{{ statusIcon(d.status) }}</span>
        <div class="alert-info"><p class="alert-name">{{ sensorId(d) }} — {{ d.location }}</p><p class="alert-sub">{{ t('iot.status.' + d.status) }}</p></div>
        <button class="btn btn--outline" style="font-size:0.75rem" @click="store.investigateAlert(d)">{{ t('iot.alerts.investigate') }}</button>
        <button class="btn btn--danger" style="font-size:0.75rem" @click="store.scheduleReplacement(d.id)">{{ t('iot.alerts.scheduleReplacement') }}</button>
      </div>
    </div>

    <div v-if="store.reconnectedDevice" class="modal-backdrop" @click="store.dismissReconnectedModal()">
      <div class="modal card" @click.stop>
        <span class="material-icons" style="font-size:2rem;color:var(--green);margin-bottom:.5rem">check_circle</span>
        <h2>{{ t('iot.modal.title') }}</h2>
        <p>{{ sensorId(store.reconnectedDevice) }}</p>
        <button class="btn btn--primary" @click="store.dismissReconnectedModal()">OK</button>
      </div>
    </div>

    <div v-if="showRegister" class="modal-backdrop" @click="showRegister = false">
      <div class="modal card modal--form" @click.stop>
        <h2 class="chart-title">{{ t('iot.register.title') }}</h2>

        <div class="form-field">
          <label>{{ t('iot.register.equipment') }}</label>
          <select v-model="form.equipmentId">
            <option value="" disabled>— {{ t('iot.register.selectEquipment') }} —</option>
            <option v-for="eq in equipmentOptions" :key="eq.id" :value="eq.id">{{ eq.name }}</option>
          </select>
        </div>
        <div class="form-field">
          <label>{{ t('iot.register.macAddress') }}</label>
          <input v-model="form.macAddress" placeholder="A4:C3:F0:12:0D:77" />
        </div>
        <div class="form-field">
          <label>{{ t('iot.register.location') }}</label>
          <input :value="form.location" disabled placeholder="—" />
        </div>

        <p v-if="registerError" class="error-msg">{{ registerError }}</p>

        <div class="modal-footer">
          <button class="btn btn--outline" @click="showRegister = false">{{ t('iot.register.cancel') }}</button>
          <button class="btn btn--primary" :disabled="store.loading" @click="submitRegister">{{ t('iot.register.submit') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kpi-row { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); margin-bottom: 1rem; }
.kpi-card { align-items: center; display: flex; gap: 1rem; }
.kpi-icon { font-size: 2rem; }
.kpi-label { color: var(--text-secondary); font-size: 0.8rem; }
.kpi-val { font-size: 1.75rem; font-weight: 700; }
.kpi-val--red { color: var(--red); }
.filters { display: flex; gap: .75rem; margin-bottom: 1rem; }
.data-table { border-collapse: collapse; font-size: 0.82rem; width: 100%; }
.data-table th { background: var(--bg-surface); border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 500; padding: .5rem .75rem; text-align: left; }
.data-table td { border-bottom: 1px solid rgba(255,255,255,.04); padding: .5rem .75rem; }
.cell-id { color: var(--accent); font-family: monospace; }
.table-empty { color: var(--text-secondary); padding: 1.5rem; text-align: center; }
.status-chip { align-items: center; border-radius: 999px; display: inline-flex; font-size: 0.72rem; font-weight: 600; gap: 3px; padding: 2px 8px; }
.status-chip--green { background: rgba(34,197,94,.15); color: var(--green); }
.status-chip--red   { background: rgba(239,68,68,.15);  color: var(--red); }
.status-chip--amber { background: rgba(245,188,54,.15); color: var(--accent); }
.bat-green { color: var(--green); } .bat-amber { color: var(--accent); } .bat-red { color: var(--red); }
.alerts-card { margin-top: 1rem; }
.chart-title { font-size: 0.9rem; font-weight: 600; margin-bottom: .75rem; }
.alert-row { align-items: center; border-bottom: 1px solid var(--border); display: flex; gap: .75rem; padding: .5rem 0; }
.alert-info { flex: 1; }
.alert-name { font-size: 0.82rem; font-weight: 500; }
.alert-sub  { color: var(--text-secondary); font-size: 0.75rem; }
.modal-backdrop { align-items: center; background: rgba(0,0,0,.6); bottom: 0; display: flex; justify-content: center; left: 0; position: fixed; right: 0; top: 0; z-index: 400; }
.modal { align-items: center; display: flex; flex-direction: column; gap: .5rem; max-width: 320px; padding: 2rem; text-align: center; }
.modal--form { align-items: stretch; max-width: 380px; text-align: left; }
.form-field { display: flex; flex-direction: column; gap: .3rem; margin-bottom: .75rem; }
.form-field label { color: var(--text-secondary); font-size: .78rem; font-weight: 500; }
.error-msg { background: rgba(239,68,68,.1); border: 1px solid var(--red); border-radius: 6px; color: var(--red); font-size: .8rem; padding: .5rem .75rem; }
.modal-footer { display: flex; gap: .6rem; justify-content: flex-end; margin-top: .5rem; }
@media (max-width: 900px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
</style>
