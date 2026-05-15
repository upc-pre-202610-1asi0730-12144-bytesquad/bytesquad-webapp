<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useIotStore } from '@/iot/application/iot.store.js';
import { IotStatus } from '@/iot/domain/model/iot.entity.js';

const { t } = useI18n();
const store = useIotStore();

const search        = ref('');
const filterStatus  = ref('');

const filteredDevices = computed(() => {
  let list = store.devices;
  const q = search.value.toLowerCase().trim();
  if (q) list = list.filter(d => d.location.toLowerCase().includes(q) || d.macAddress.toLowerCase().includes(q));
  if (filterStatus.value) list = list.filter(d => d.status === filterStatus.value);
  return list;
});

function sensorId(d)    { return `SEN-${String(d.id).padStart(3, '0')}`; }
function statusIcon(s)  { return s === IotStatus.ONLINE ? 'wifi' : s === IotStatus.OFFLINE ? 'wifi_off' : 'warning'; }
function statusClass(s) { return s === IotStatus.ONLINE ? 'green' : s === IotStatus.OFFLINE ? 'red' : 'amber'; }
function batteryIcon(b) { return b > 60 ? 'battery_full' : b > 20 ? 'battery_3_bar' : 'battery_alert'; }
function batteryClass(b){ return b > 60 ? 'green' : b > 20 ? 'amber' : 'red'; }
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('iot.title') }}</h1>
      <button class="btn btn--outline" @click="store.loadDevices()"><span class="material-icons" style="font-size:16px">refresh</span> {{ t('iot.actions.refresh') }}</button>
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
            <td><span class="status-chip" :class="`status-chip--${statusClass(d.status)}`"><span class="material-icons" style="font-size:14px">{{ statusIcon(d.status) }}</span> {{ d.status }}</span></td>
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
        <div class="alert-info"><p class="alert-name">{{ sensorId(d) }} — {{ d.location }}</p><p class="alert-sub">{{ d.status }}</p></div>
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
@media (max-width: 900px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
</style>
