<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { gymState } from '@/shared/application/gym-state.service.js';
import { useReservationStore } from '@/reservation/application/reservation.store.js';

const { t } = useI18n();
const reservationStore = useReservationStore();

const categoryFilter = ref('ALL');
const selectedMachine = ref(null);
const showAlternatives = ref(false);
const notification = ref('');

const CATEGORIES = ['ALL', 'STRENGTH', 'CARDIO'];

const STATUS_COLOR = { AVAILABLE: 'var(--green)', IN_USE: 'var(--red)', RESERVED: 'var(--accent)' };

const filteredMachines = computed(() => {
  const ms = gymState.machines.value;
  if (categoryFilter.value === 'ALL') return ms;
  return ms.filter(m => m.category === categoryFilter.value);
});

const availableCount = computed(() => gymState.machines.value.filter(m => m.status === 'AVAILABLE').length);
const inUseCount     = computed(() => gymState.machines.value.filter(m => m.status === 'IN_USE').length);
const reservedCount  = computed(() => gymState.machines.value.filter(m => m.status === 'RESERVED').length);

const alternatives = computed(() => {
  if (!selectedMachine.value) return [];
  return gymState.machines.value.filter(m =>
    m.id !== selectedMachine.value.id &&
    m.category === selectedMachine.value.category &&
    m.status === 'AVAILABLE'
  );
});

function selectMachine(m) {
  selectedMachine.value = gymState.machines.value.find(x => x.id === m.id) ?? m;
  showAlternatives.value = false;
  notification.value = '';
}

function closeMachineDetail() {
  selectedMachine.value = null;
  showAlternatives.value = false;
  notification.value = '';
}

function notifyWhenFree()  { notification.value = 'notified'; }
function reportFree() {
  if (selectedMachine.value) {
    gymState.setMachineAsAvailable(selectedMachine.value.id);
    notification.value = 'reportedFree';
    selectedMachine.value = gymState.machines.value.find(m => m.id === selectedMachine.value?.id) ?? null;
  }
}
function reportOccupied()  { notification.value = 'reportedOccupied'; }

function reserveMachine(machineId) {
  reservationStore.createReservation(machineId, 600);
  notification.value = 'reserved';
  selectedMachine.value = gymState.machines.value.find(m => m.id === machineId) ?? null;
}

function isReservedByUser(machine) {
  return machine.status === 'RESERVED' &&
    reservationStore.reservedMachines.some(r => r.id === machine.id);
}

function machineName(nameKey) {
  return t(`machines.names.${nameKey}`) || nameKey;
}
</script>

<template>
  <div class="page">
    <div class="map-page-header">
      <div>
        <h1 class="page__title">{{ t('map.title') }}</h1>
        <p class="page__subtitle">{{ t('map.subtitle') }}</p>
      </div>
    </div>

    <!-- Category filter tabs -->
    <div class="filter-tabs">
      <button v-for="cat in CATEGORIES" :key="cat"
        class="tab-btn" :class="{ 'tab-btn--active': categoryFilter === cat }"
        @click="categoryFilter = cat">
        {{ t(`map.filter.${cat.toLowerCase()}`) }}
      </button>
    </div>

    <div class="map-layout" :class="{ 'map-layout--panel-open': selectedMachine }">
      <!-- Floor map -->
      <div class="card floor-map" @click.self="closeMachineDetail">
        <h2 class="map-card-title">{{ t('map.cardTitle') }}</h2>

        <div class="floor-grid">
          <div
            v-for="m in filteredMachines" :key="m.id"
            class="machine-pin"
            :class="{ 'machine-pin--selected': selectedMachine?.id === m.id }"
            :style="{ top: m.top, left: m.left }"
            @click.stop="selectMachine(m)"
          >
            <!-- Timer badge above pin -->
            <div v-if="m.status === 'RESERVED' && m.timerSeconds !== undefined" class="timer-badge">
              {{ reservationStore.formatTimer(m.timerSeconds) }}
            </div>
            <!-- Circular pin -->
            <div class="pin-circle" :style="{ background: STATUS_COLOR[m.status] + '28', borderColor: STATUS_COLOR[m.status] }">
              <span class="material-icons pin-icon" :style="{ color: STATUS_COLOR[m.status] }">{{ m.icon }}</span>
            </div>
            <!-- Machine name below -->
            <span class="pin-label">{{ machineName(m.nameKey) }}</span>
          </div>
        </div>
      </div>

      <!-- Machine detail panel -->
      <div v-if="selectedMachine" class="card detail-panel">
        <div class="detail-header">
          <div class="detail-icon-wrap" :style="{ background: STATUS_COLOR[selectedMachine.status] + '22' }">
            <span class="material-icons" :style="{ color: STATUS_COLOR[selectedMachine.status] }">{{ selectedMachine.icon }}</span>
          </div>
          <div>
            <h3 class="detail-name">{{ machineName(selectedMachine.nameKey) }}</h3>
            <span class="detail-category">{{ t(`map.muscleGroups.${selectedMachine.muscleGroupKey}`) }}</span>
          </div>
          <button class="close-btn" @click="closeMachineDetail">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="detail-status-row">
          <span class="status-badge" :style="{ background: STATUS_COLOR[selectedMachine.status] + '22', color: STATUS_COLOR[selectedMachine.status] }">
            {{ t(`map.detail.status.${selectedMachine.status}`) }}
          </span>
          <span v-if="selectedMachine.status === 'RESERVED' && selectedMachine.timerSeconds !== undefined" class="timer-chip">
            {{ reservationStore.formatTimer(selectedMachine.timerSeconds) }}
          </span>
        </div>

        <p v-if="isReservedByUser(selectedMachine)" class="reserved-by-user">
          <span class="material-icons" style="font-size:14px">person</span>
          {{ t('map.detail.reservedByUser') }}
        </p>

        <div v-if="notification" class="notif-banner">
          <span class="material-icons" style="font-size:16px">check_circle</span>
          {{ t(`map.detail.notifications.${notification}`) }}
        </div>

        <div class="detail-actions">
          <template v-if="selectedMachine.status === 'AVAILABLE'">
            <button class="btn btn--accent" @click="reserveMachine(selectedMachine.id)">
              <span class="material-icons" style="font-size:16px">event_available</span>
              {{ t('map.detail.reserveBtn') }}
            </button>
            <button class="btn btn--outline" @click="reportOccupied">
              <span class="material-icons" style="font-size:16px">report</span>
              {{ t('map.detail.reportOccupiedBtn') }}
            </button>
          </template>
          <template v-else-if="selectedMachine.status === 'IN_USE'">
            <button class="btn btn--outline" @click="notifyWhenFree">
              <span class="material-icons" style="font-size:16px">notifications</span>
              {{ t('map.detail.notifyBtn') }}
            </button>
            <button class="btn btn--outline" @click="reportFree">
              <span class="material-icons" style="font-size:16px">check</span>
              {{ t('map.detail.reportFreeBtn') }}
            </button>
          </template>
          <template v-else>
            <button class="btn btn--outline" @click="notifyWhenFree">
              <span class="material-icons" style="font-size:16px">notifications</span>
              {{ t('map.detail.notifyBtn') }}
            </button>
          </template>

          <button class="btn btn--outline btn--full" @click="showAlternatives = !showAlternatives">
            <span class="material-icons" style="font-size:16px">swap_horiz</span>
            {{ t('map.detail.alternativesBtn') }}
          </button>
        </div>

        <div v-if="showAlternatives" class="alternatives">
          <h4 class="alt-title">{{ t('map.alternatives.title') }}</h4>
          <p class="alt-sub">{{ t('map.alternatives.subtitle') }}</p>
          <div v-if="!alternatives.length" class="alt-empty">
            <span class="material-icons" style="color:var(--text-secondary)">search_off</span>
          </div>
          <div v-for="alt in alternatives" :key="alt.id" class="alt-row">
            <span class="material-icons" style="color:var(--green);font-size:18px">{{ alt.icon }}</span>
            <span class="alt-name">{{ machineName(alt.nameKey) }}</span>
            <span class="alt-free">{{ t('map.alternatives.free') }}</span>
            <button class="btn btn--outline" style="padding:.2rem .6rem;font-size:.75rem"
              @click="reserveMachine(alt.id); showAlternatives = false">
              {{ t('map.alternatives.reserveBtn') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend at bottom -->
    <div class="legend-row">
      <span class="legend-dot" style="background:var(--green)"></span>
      <span class="legend-label">{{ t('map.legend.available', { count: availableCount }) }}</span>
      <span class="legend-dot" style="background:var(--red)"></span>
      <span class="legend-label">{{ t('map.legend.inUse', { count: inUseCount }) }}</span>
      <span class="legend-dot" style="background:var(--accent)"></span>
      <span class="legend-label">{{ t('map.legend.reserved', { count: reservedCount }) }}</span>
    </div>
  </div>
</template>

<style scoped>
.map-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .75rem; }
.page__subtitle { color: var(--text-secondary); font-size: .85rem; margin-top: .25rem; }
.filter-tabs { display: flex; gap: .5rem; margin-bottom: 1rem; }
.tab-btn { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 20px; color: var(--text-secondary); cursor: pointer; font-size: .8rem; padding: .3rem .9rem; transition: all .15s; }
.tab-btn--active { background: var(--accent); border-color: var(--accent); color: #000; font-weight: 600; }
.map-layout { display: grid; gap: 1rem; grid-template-columns: 1fr; margin-bottom: .75rem; }
.floor-map { min-height: 480px; position: relative; overflow: hidden; }
.map-card-title { font-size: .9rem; font-weight: 600; margin-bottom: .5rem; }
.floor-grid { height: 440px; position: relative; }
.machine-pin { align-items: center; cursor: pointer; display: flex; flex-direction: column; gap: 5px; position: absolute; transform: translate(-50%, -50%); transition: transform .1s; width: 72px; }
.machine-pin:hover { transform: translate(-50%, -50%) scale(1.08); }
.pin-circle { align-items: center; border: 2px solid transparent; border-radius: 50%; display: flex; height: 50px; justify-content: center; transition: border-color .15s; width: 50px; }
.machine-pin--selected .pin-circle { box-shadow: 0 0 0 3px var(--accent); }
.pin-icon { font-size: 22px; }
.pin-label { color: var(--text-primary); font-size: .7rem; text-align: center; max-width: 72px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.timer-badge { background: var(--accent); border-radius: 8px; color: #000; font-size: .65rem; font-weight: 700; padding: 1px 5px; }
.detail-panel { display: flex; flex-direction: column; gap: .75rem; }
.detail-header { align-items: flex-start; display: flex; gap: .75rem; }
.detail-icon-wrap { align-items: center; border-radius: 10px; display: flex; flex-shrink: 0; height: 44px; justify-content: center; width: 44px; }
.detail-name { font-size: .95rem; font-weight: 600; }
.detail-category { color: var(--text-secondary); font-size: .78rem; }
.close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-left: auto; padding: .2rem; }
.detail-status-row { align-items: center; display: flex; gap: .5rem; }
.status-badge { border-radius: 12px; font-size: .78rem; font-weight: 600; padding: .2rem .6rem; }
.timer-chip { background: rgba(245,188,54,.15); border-radius: 6px; color: var(--accent); font-size: .78rem; font-weight: 700; padding: .2rem .5rem; }
.reserved-by-user { align-items: center; color: var(--accent); display: flex; font-size: .8rem; gap: .3rem; }
.notif-banner { align-items: center; background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3); border-radius: 6px; color: var(--green); display: flex; font-size: .8rem; gap: .5rem; padding: .5rem .75rem; }
.detail-actions { display: flex; flex-direction: column; gap: .5rem; }
.btn--accent { background: var(--accent); border: none; color: #000; font-weight: 600; }
.btn--full { width: 100%; }
.alternatives { border-top: 1px solid var(--border); padding-top: .75rem; }
.alt-title { font-size: .85rem; font-weight: 600; margin-bottom: .2rem; }
.alt-sub { color: var(--text-secondary); font-size: .78rem; margin-bottom: .75rem; }
.alt-empty { align-items: center; display: flex; justify-content: center; padding: .75rem 0; }
.alt-row { align-items: center; display: flex; gap: .75rem; padding: .4rem 0; }
.alt-name { flex: 1; font-size: .83rem; }
.alt-free { color: var(--green); font-size: .75rem; font-weight: 600; }
.legend-row { align-items: center; display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: center; padding: .5rem 0; }
.legend-dot { border-radius: 50%; display: inline-block; height: 10px; width: 10px; }
.legend-label { color: var(--text-secondary); font-size: .82rem; }
@media (min-width: 960px) {
  .map-layout--panel-open { grid-template-columns: 1fr 320px; }
  .floor-map { min-height: 540px; }
  .floor-grid { height: 500px; }
}
</style>
