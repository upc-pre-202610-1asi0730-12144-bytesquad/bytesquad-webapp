<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGymStore } from '@/gym/application/gym.store.js';
import { useEquipmentStore } from '@/gym/application/equipment.store.js';
import { useReservationStore } from '@/reservation/application/reservation.store.js';
import { useActiveGymStore } from '@/profiles/application/active-gym.store.js';
import { ReservationStatus } from '@/reservation/domain/model/reservation.entity.js';

const { t } = useI18n();
const gymStore         = useGymStore();
const equipmentStore   = useEquipmentStore();
const reservationStore = useReservationStore();
const activeGymStore   = useActiveGymStore();

const selectedBranchId = ref(null);
const viewMode         = ref('MAP');       // MAP | HEATMAP | ALL_BRANCHES
const activeFilter     = ref('ALL');       // ALL | CARDIO | STRENGTH
const selectedEquipmentId = ref(null);
const showAlternatives = ref(false);
const toast             = ref(null);

const dataLoading = computed(() => gymStore.loading);
const dataError   = computed(() => gymStore.error);

onMounted(async () => {
  await activeGymStore.loadAssociations();
  const gymId = activeGymStore.activeGymId;
  if (!gymId) return;
  await Promise.all([
    gymStore.loadBranches(gymId),
    gymStore.loadZones(gymId),
    equipmentStore.loadEquipment(),
    reservationStore.loadMine(),
  ]);
  reservationStore.loadUsageCounts(equipmentStore.equipment.map(e => e.id));
});

watch(() => gymStore.branches, list => {
  if (list.length > 0 && !selectedBranchId.value) selectedBranchId.value = list[0].id;
}, { immediate: true });

// ── Client-side grouping: equipment → zone → branch ────────────────────────

const zoneMap = computed(() => new Map(gymStore.zones.map(z => [z.id, z])));

const selectedBranchZones = computed(() =>
  selectedBranchId.value ? gymStore.zones.filter(z => z.branchId === selectedBranchId.value) : []);

function resolveIcon(name) {
  const n = name.toLowerCase();
  if (/treadmill|cinta|running|caminadora/.test(n)) return 'directions_run';
  if (/bike|cycl|bicicleta|est[aá]tica/.test(n))    return 'directions_bike';
  if (/elliptic|el[ií]ptic/.test(n))                 return 'directions_bike';
  if (/row|remo/.test(n))                            return 'rowing';
  return 'fitness_center';
}

function equipmentCategory(name) {
  const n = name.toLowerCase();
  return /treadmill|bike|cycl|elliptic|row|cardio|cinta|remo|bicicleta|caminadora/.test(n)
    ? 'CARDIO' : 'STRENGTH';
}

// Auto-layout: positions equipment in a simple grid inside its zone's column.
// There is no real floor-plan geometry in the backend, so pin positions are
// computed, not stored — the equipment/zone/status data behind them is real.
function autoPositionInZone(i, total, colLeftPct, colWidthPct) {
  const n       = Math.max(1, total);
  const cols    = Math.max(1, Math.min(3, Math.ceil(Math.sqrt(n))));
  const rows    = Math.ceil(n / cols);
  const col     = i % cols;
  const row     = Math.floor(i / cols);
  const margin  = colWidthPct * 0.08;
  const usableW = colWidthPct - 2 * margin;
  const cellW   = usableW / cols;
  const cellH   = 62 / Math.max(rows, 1);
  return {
    left: `${colLeftPct + margin + col * cellW + cellW * 0.5}%`,
    top:  `${22 + row * cellH + cellH * 0.5}%`,
  };
}

const zoneLayout = computed(() => {
  const zones    = selectedBranchZones.value;
  const zMap     = zoneMap.value;
  const branchId = selectedBranchId.value;

  const buckets = new Map(zones.map(z => [z.id, []]));
  const unzoned = [];

  for (const eq of equipmentStore.equipment) {
    const zone = zMap.get(eq.zoneId);
    if (zone && zone.branchId === branchId) buckets.get(zone.id).push(eq);
    else if (!zone) unzoned.push(eq);
  }

  const cols = zones.map(z => ({ zone: z, zoneName: z.name, equipment: buckets.get(z.id) ?? [] }));
  if (unzoned.length > 0) cols.push({ zone: null, zoneName: '__unzoned__', equipment: unzoned });

  const n = cols.length || 1;
  return cols.map((col, i) => {
    const colLeftPct  = (i / n) * 100;
    const colWidthPct = 100 / n;
    return {
      ...col,
      colLeftPct,
      colWidthPct,
      equipment: col.equipment.map((eq, j) => ({
        eq,
        ...autoPositionInZone(j, col.equipment.length, colLeftPct, colWidthPct),
        icon: resolveIcon(eq.name),
        category: equipmentCategory(eq.name),
      })),
    };
  });
});

const filteredZoneLayout = computed(() => {
  if (activeFilter.value === 'ALL') return zoneLayout.value;
  return zoneLayout.value.map(col => ({
    ...col,
    equipment: col.equipment.filter(e => e.category === activeFilter.value),
  }));
});

// ── Branch-level helpers for the ALL_BRANCHES view ─────────────────────────

function branchEquipment(branchId) {
  const zoneIds = new Set(gymStore.zones.filter(z => z.branchId === branchId).map(z => z.id));
  return equipmentStore.equipment.filter(eq => zoneIds.has(eq.zoneId));
}
function branchAvailable(branchId) {
  return branchEquipment(branchId).filter(e => e.status === 'Available').length;
}
function branchInUse(branchId) {
  return branchEquipment(branchId).filter(e => e.status === 'Occupied' || e.status === 'Active').length;
}
function branchUtilization(branchId) {
  const eq = branchEquipment(branchId);
  const total = eq.length || 1;
  return Math.round(((total - branchAvailable(branchId)) / total) * 100);
}
function branchMiniMapItems(branchId) {
  const eq = branchEquipment(branchId);
  return eq.map((e, i) => ({
    ...autoPositionInZone(i, eq.length, 0, 100),
    icon: resolveIcon(e.name),
    key: e.id,
  }));
}

// ── Stats for the selected branch ──────────────────────────────────────────

const availableCount = computed(() => selectedBranchId.value ? branchAvailable(selectedBranchId.value) : 0);
const inUseCount     = computed(() => selectedBranchId.value ? branchInUse(selectedBranchId.value) : 0);
const reservedCount  = computed(() => pendingEquipmentIds.value.size);
const utilization    = computed(() => selectedBranchId.value ? branchUtilization(selectedBranchId.value) : 0);

// ── Pending (client's own reservation not yet active) ──────────────────────

const pendingEquipmentIds = computed(() => new Set(
  reservationStore.reservations
    .filter(r => r.status === ReservationStatus.Initiated || r.status === ReservationStatus.Reserved)
    .map(r => r.equipmentId)));

function isPending(equipmentId) { return pendingEquipmentIds.value.has(equipmentId); }
function isInUse(status) { return status === 'Occupied' || status === 'Active'; }

function pinStatusClass(equipmentId, status) {
  if (isPending(equipmentId)) return 'pin-reserved';
  if (isInUse(status)) return 'pin-in-use';
  if (status === 'Maintenance' || status === 'OutOfService' || status === 'Decommissioned') return 'pin-maintenance';
  return 'pin-available';
}

// ── Selected equipment detail ───────────────────────────────────────────────

const selectedEquipment = computed(() => {
  const id = selectedEquipmentId.value;
  if (!id) return null;
  return zoneLayout.value.flatMap(c => c.equipment).find(e => e.eq.id === id) ?? null;
});

const alternativeEquipment = computed(() => {
  const sel = selectedEquipment.value;
  if (!sel) return [];
  return zoneLayout.value.flatMap(c => c.equipment).filter(e =>
    e.eq.status === 'Available' && e.eq.id !== sel.eq.id && e.category === sel.category);
});

function openEquipmentDetail(id) {
  selectedEquipmentId.value = id;
  showAlternatives.value = false;
}
function closeMachineDetail() {
  selectedEquipmentId.value = null;
  showAlternatives.value = false;
}
function openAlternatives() { showAlternatives.value = true; }

function selectBranch(branchId) {
  selectedBranchId.value = branchId;
  viewMode.value = 'MAP';
}

// ── Heatmap intensity (mirrors the reference: a fixed value per real status,
// not historical analytics — the usage-count chip below it is the real number) ──

const liveIntensityByEquipmentId = computed(() => {
  const result = {};
  for (const eq of equipmentStore.equipment) {
    switch (eq.status) {
      case 'Occupied':     result[eq.id] = 1.0;  break;
      case 'Active':       result[eq.id] = 0.8;  break;
      case 'OutOfService':
      case 'Decommissioned': result[eq.id] = 0.55; break;
      case 'Maintenance':  result[eq.id] = 0.45; break;
      default:              result[eq.id] = isPending(eq.id) ? 0.65 : 0.0;
    }
  }
  return result;
});

function rgbFromIntensity(t) {
  if (t <= 0)   return [30, 80, 200];
  if (t < 0.25) return [0, Math.round(t * 4 * 150), 255];
  if (t < 0.5)  { const s = (t - 0.25) * 4; return [0, 150 + Math.round(s * 105), Math.round(255 * (1 - s))]; }
  if (t < 0.75) { const s = (t - 0.5)  * 4; return [Math.round(s * 255), 255, 0]; }
  const s = (t - 0.75) * 4; return [255, Math.round(255 * (1 - s)), 0];
}
function branchHeatColor(key) {
  const [r, g, b] = rgbFromIntensity(liveIntensityByEquipmentId.value[key] ?? 0);
  return `rgb(${r},${g},${b})`;
}
function branchHeatOpacity(key) {
  return 0.12 + (liveIntensityByEquipmentId.value[key] ?? 0) * 0.78;
}

// ── Cosmetic-only actions (no backend endpoint exists for these — matches
// the reference, which also only shows a confirmation toast for them) ──────

function showToast(message) {
  toast.value = message;
  setTimeout(() => { toast.value = null; }, 3000);
}

async function reserveMachine() {
  const sel = selectedEquipment.value;
  if (!sel) return;
  closeMachineDetail();
  const start = new Date();
  const end   = new Date(start.getTime() + 15 * 60 * 1000);
  const created = await reservationStore.expressCreate(sel.eq.id, start.toISOString(), end.toISOString());
  if (created) showToast(t('map.detail.notifications.reserved'));
}

function notifyWhenFree()   { closeMachineDetail(); showToast(t('map.detail.notifications.notified')); }
function reportAsFree()     { closeMachineDetail(); showToast(t('map.detail.notifications.reportedFree')); }
function reportAsOccupied() { closeMachineDetail(); showToast(t('map.detail.notifications.reportedOccupied')); }
</script>

<template>
  <div class="map-root" @click="closeMachineDetail">
    <header class="map-header">
      <div class="header-meta">
        <div class="live-pill"><span class="live-dot"></span><span class="live-text">LIVE</span></div>
        <div>
          <h1 class="map-title">{{ t('map.title') }}</h1>
          <p class="map-subtitle">{{ t('map.subtitle') }}</p>
        </div>
      </div>

      <div class="header-controls">
        <div class="gym-selector">
          <span class="material-icons" style="font-size:18px">location_on</span>
          <select v-model="selectedBranchId" class="gym-select" @click.stop>
            <option v-for="b in gymStore.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>

        <div class="view-tabs">
          <button class="view-tab" :class="{ active: viewMode === 'MAP' }" @click.stop="viewMode = 'MAP'">
            <span class="material-icons" style="font-size:16px">map</span>{{ t('map.view.map') }}
          </button>
          <button class="view-tab" :class="{ active: viewMode === 'HEATMAP' }" @click.stop="viewMode = 'HEATMAP'">
            <span class="material-icons" style="font-size:16px">local_fire_department</span>{{ t('map.view.heat') }}
          </button>
          <button class="view-tab" :class="{ active: viewMode === 'ALL_BRANCHES' }" @click.stop="viewMode = 'ALL_BRANCHES'">
            <span class="material-icons" style="font-size:16px">business</span>{{ t('map.view.allBranches') }}
          </button>
        </div>
      </div>
    </header>

    <div v-if="dataLoading" class="empty-state card">
      <span class="material-icons empty-icon spin">autorenew</span>
      <p>{{ t('map.branches.loading') }}</p>
    </div>

    <template v-else>
      <div v-if="dataError" class="empty-state card">
        <span class="material-icons empty-icon">error_outline</span>
        <p>{{ dataError }}</p>
      </div>

      <div v-else-if="!gymStore.branches.length" class="empty-state card">
        <span class="material-icons empty-icon">location_off</span>
        <p>{{ t('map.branches.noBranches') }}</p>
      </div>

      <template v-else>
        <div v-if="viewMode !== 'ALL_BRANCHES'" class="stats-bar">
          <div class="stat-pill stat-green">
            <span class="material-icons">check_circle</span>
            <span class="stat-num">{{ availableCount }}</span><span class="stat-lbl">{{ t('map.stats.free') }}</span>
          </div>
          <div class="stat-pill stat-red">
            <span class="material-icons">person</span>
            <span class="stat-num">{{ inUseCount }}</span><span class="stat-lbl">{{ t('map.stats.inUse') }}</span>
          </div>
          <div class="stat-pill stat-yellow">
            <span class="material-icons">schedule</span>
            <span class="stat-num">{{ reservedCount }}</span><span class="stat-lbl">{{ t('map.stats.reserved') }}</span>
          </div>
          <div class="stat-pill stat-util">
            <span class="material-icons">bar_chart</span>
            <span class="stat-num">{{ utilization }}%</span><span class="stat-lbl">{{ t('map.stats.util') }}</span>
          </div>
        </div>

        <div v-if="viewMode === 'MAP'" class="filter-bar">
          <button class="filter-chip" :class="{ active: activeFilter === 'ALL' }" @click.stop="activeFilter = 'ALL'">{{ t('map.filter.all') }}</button>
          <button class="filter-chip" :class="{ active: activeFilter === 'CARDIO' }" @click.stop="activeFilter = 'CARDIO'">{{ t('map.filter.cardio') }}</button>
          <button class="filter-chip" :class="{ active: activeFilter === 'STRENGTH' }" @click.stop="activeFilter = 'STRENGTH'">{{ t('map.filter.strength') }}</button>
        </div>

        <div v-if="viewMode === 'HEATMAP'" class="heat-legend-bar">
          <span>Low</span><div class="heat-gradient-strip"></div><span>High</span>
        </div>

        <!-- MAP -->
        <div v-if="viewMode === 'MAP'" class="floor-plan-wrap">
          <div class="floor-plan">
            <template v-for="(col, i) in filteredZoneLayout" :key="col.zone?.id ?? '__unzoned__'">
              <div v-if="i > 0" class="zone-wall" :style="{ left: col.colLeftPct + '%' }"></div>
              <div class="zone-label" :style="{ left: (col.colLeftPct + col.colWidthPct / 2) + '%' }">
                {{ col.zoneName === '__unzoned__' ? t('map.zone.unzoned') : col.zoneName }}
              </div>
            </template>

            <p v-if="!filteredZoneLayout.length" class="empty-zone-msg">
              <span class="material-icons">location_searching</span> {{ t('map.branches.noZones') }}
            </p>

            <template v-for="col in filteredZoneLayout" :key="(col.zone?.id ?? '__unzoned__') + '-eq'">
              <div v-for="item in col.equipment" :key="item.eq.id"
                class="machine-pin" :class="pinStatusClass(item.eq.id, item.eq.status)"
                :style="{ top: item.top, left: item.left }"
                @click.stop="openEquipmentDetail(item.eq.id)">
                <div class="pin-ring ring-a"></div>
                <div class="pin-ring ring-b"></div>
                <div class="pin-body"><span class="material-icons pin-icon">{{ item.icon }}</span></div>
                <span class="pin-label">{{ item.eq.name }}</span>
              </div>
            </template>
          </div>

          <div class="floor-legend">
            <div class="legend-item"><span class="ldot ldot-green"></span>{{ t('map.legend.available', { count: availableCount }) }}</div>
            <div class="legend-item"><span class="ldot ldot-red"></span>{{ t('map.legend.inUse', { count: inUseCount }) }}</div>
            <div class="legend-item"><span class="ldot ldot-yellow"></span>{{ t('map.legend.reserved', { count: reservedCount }) }}</div>
          </div>
        </div>

        <!-- HEATMAP -->
        <div v-else-if="viewMode === 'HEATMAP'" class="floor-plan-wrap">
          <div class="floor-plan heat-mode">
            <template v-for="col in zoneLayout" :key="(col.zone?.id ?? '__unzoned__') + '-heat'">
              <div v-for="item in col.equipment" :key="item.eq.id"
                class="heat-blob" :style="{ top: item.top, left: item.left,
                  backgroundColor: branchHeatColor(item.eq.id), opacity: branchHeatOpacity(item.eq.id) }"></div>
            </template>
            <template v-for="col in zoneLayout" :key="(col.zone?.id ?? '__unzoned__') + '-ghost'">
              <div v-for="item in col.equipment" :key="item.eq.id" class="machine-pin pin-ghost" :style="{ top: item.top, left: item.left }">
                <div class="ghost-body"><span class="material-icons">{{ item.icon }}</span></div>
                <span class="usage-chip">{{ reservationStore.usageCounts[item.eq.id] ?? 0 }}</span>
                <span class="pin-label">{{ item.eq.name }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- ALL BRANCHES -->
        <div v-else class="all-gyms-section">
          <h2 class="all-gyms-title">{{ t('map.branches.networkOverview') }}</h2>
          <p class="all-gyms-sub">{{ t('map.branches.clickToView') }}</p>

          <div class="gym-cards-grid">
            <div v-for="branch in gymStore.branches" :key="branch.id"
              class="card gym-card" :class="{ 'gym-card--active': branch.id === selectedBranchId }"
              @click.stop="selectBranch(branch.id)">
              <div class="gym-card-top">
                <div class="gym-card-name"><span class="material-icons" style="font-size:18px">location_on</span>{{ branch.name }}</div>
                <div class="util-badge">{{ branchUtilization(branch.id) }}%</div>
              </div>

              <div class="mini-map">
                <div v-for="item in branchMiniMapItems(branch.id)" :key="'blob-' + item.key" class="heat-blob"
                  :style="{ top: item.top, left: item.left, backgroundColor: branchHeatColor(item.key), opacity: branchHeatOpacity(item.key) }"></div>
                <div v-for="item in branchMiniMapItems(branch.id)" :key="'pin-' + item.key" class="mini-pin" :style="{ top: item.top, left: item.left }">
                  <span class="material-icons" style="font-size:14px">{{ item.icon }}</span>
                </div>
              </div>

              <div class="gym-card-stats">
                <span class="gym-stat gym-stat--green">{{ branchAvailable(branch.id) }} {{ t('map.stats.free') }}</span>
                <span class="gym-stat gym-stat--red">{{ branchInUse(branch.id) }} {{ t('map.stats.inUse') }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- Machine detail popup -->
    <div v-if="selectedEquipment" class="detail-backdrop" @click="closeMachineDetail">
      <div v-if="!showAlternatives" class="detail-popup card" @click.stop>
        <div class="detail-header">
          <div class="detail-header-info">
            <div class="detail-icon-wrap"><span class="material-icons">{{ selectedEquipment.icon }}</span></div>
            <div>
              <h3 class="detail-name">{{ selectedEquipment.eq.name }}</h3>
              <p class="detail-status-row">
                {{ t('map.detail.statusLabel') }}:
                <span class="badge" :class="pinStatusClass(selectedEquipment.eq.id, selectedEquipment.eq.status)">
                  {{ isPending(selectedEquipment.eq.id) ? t('map.detail.status.RESERVED') : t(`map.detail.status.${selectedEquipment.eq.status}`) }}
                </span>
              </p>
            </div>
          </div>
          <button class="close-btn" @click="closeMachineDetail"><span class="material-icons">close</span></button>
        </div>

        <p v-if="isPending(selectedEquipment.eq.id)" class="detail-msg">{{ t('map.detail.reservedByUser') }}</p>

        <div v-else-if="isInUse(selectedEquipment.eq.status)" class="detail-actions">
          <button class="btn btn--outline" @click="notifyWhenFree">{{ t('map.detail.notifyBtn') }}</button>
          <button class="btn btn--outline" @click="openAlternatives">{{ t('map.detail.alternativesBtn') }}</button>
          <button class="btn btn--outline" @click="reportAsFree">{{ t('map.detail.reportFreeBtn') }}</button>
        </div>

        <p v-else-if="['Maintenance', 'OutOfService', 'Decommissioned'].includes(selectedEquipment.eq.status)" class="detail-msg">
          {{ t(`map.detail.status.${selectedEquipment.eq.status}`) }}
        </p>

        <div v-else class="detail-actions">
          <button class="btn btn--primary" @click="reserveMachine">{{ t('map.detail.reserveBtn') }}</button>
          <button class="btn btn--outline" @click="reportAsOccupied">{{ t('map.detail.reportOccupiedBtn') }}</button>
        </div>
      </div>

      <div v-else class="detail-popup card" @click.stop>
        <div class="detail-header">
          <h3 class="detail-name">{{ t('map.alternatives.title') }}</h3>
          <button class="close-btn" @click="closeMachineDetail"><span class="material-icons">close</span></button>
        </div>
        <p class="detail-msg">{{ t('map.alternatives.subtitle') }}</p>
        <div class="alt-list">
          <div v-for="alt in alternativeEquipment" :key="alt.eq.id" class="alt-item">
            <span>{{ alt.eq.name }}</span>
            <span class="badge badge--green">{{ t('map.alternatives.free') }}</span>
          </div>
        </div>
        <button class="btn btn--primary" style="width:100%" @click="reserveMachine">{{ t('map.alternatives.reserveBtn') }}</button>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.map-root { position: relative; }
.map-header { align-items: center; display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; margin-bottom: 1rem; }
.header-meta { align-items: center; display: flex; gap: .75rem; }
.live-pill { align-items: center; background: rgba(239,68,68,.12); border-radius: 20px; display: flex; gap: .35rem; padding: .25rem .6rem; }
.live-dot { background: var(--red); border-radius: 50%; height: 8px; width: 8px; }
.live-text { color: var(--red); font-size: .7rem; font-weight: 700; }
.map-title { font-size: 1.1rem; font-weight: 700; }
.map-subtitle { color: var(--text-secondary); font-size: .78rem; }
.header-controls { align-items: center; display: flex; gap: .75rem; }
.gym-selector { align-items: center; background: var(--bg-card); border-radius: 8px; display: flex; gap: .35rem; padding: .35rem .6rem; }
.gym-select { background: none; border: none; color: var(--text-primary); font-size: .82rem; }
.view-tabs { display: flex; gap: .35rem; }
.view-tab { align-items: center; background: var(--bg-card); border: none; border-radius: 8px; color: var(--text-secondary); cursor: pointer; display: flex; font-size: .78rem; gap: .3rem; padding: .4rem .7rem; }
.view-tab.active { background: var(--accent); color: #1a1200; }
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .5rem; padding: 2.5rem; text-align: center; }
.empty-icon { color: var(--text-secondary); font-size: 40px; }
.empty-icon.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.stats-bar { display: grid; gap: .6rem; grid-template-columns: repeat(4, 1fr); margin-bottom: .75rem; }
.stat-pill { align-items: center; background: var(--bg-card); border-radius: 10px; display: flex; flex-direction: column; gap: .2rem; padding: .6rem; text-align: center; }
.stat-pill .material-icons { font-size: 18px; }
.stat-green .material-icons { color: var(--green); }
.stat-red .material-icons { color: var(--red); }
.stat-yellow .material-icons { color: var(--accent); }
.stat-util .material-icons { color: var(--blue); }
.stat-num { font-size: 1.1rem; font-weight: 700; }
.stat-lbl { color: var(--text-secondary); font-size: .7rem; }
.filter-bar { display: flex; gap: .5rem; margin-bottom: .75rem; }
.filter-chip { background: var(--bg-card); border: none; border-radius: 20px; color: var(--text-secondary); cursor: pointer; font-size: .78rem; padding: .3rem .8rem; }
.filter-chip.active { background: var(--accent); color: #1a1200; }
.heat-legend-bar { align-items: center; color: var(--text-secondary); display: flex; font-size: .75rem; gap: .5rem; margin-bottom: .5rem; }
.heat-gradient-strip { background: linear-gradient(90deg, #1e50c8, #00c8ff, #00ff00, #ffff00, #ff0000); border-radius: 4px; height: 8px; width: 140px; }
.floor-plan-wrap { position: relative; }
.floor-plan { background: var(--bg-card); border-radius: 12px; height: 420px; position: relative; overflow: hidden; }
.floor-plan.heat-mode { background: #0b0f1a; }
.zone-wall { background: rgba(255,255,255,.08); bottom: 0; position: absolute; top: 0; width: 1px; }
.zone-label { color: var(--text-secondary); font-size: .7rem; font-weight: 600; position: absolute; text-transform: uppercase; top: 6px; transform: translateX(-50%); }
.empty-zone-msg { align-items: center; color: var(--text-secondary); display: flex; gap: .4rem; justify-content: center; padding-top: 10rem; }
.machine-pin { align-items: center; cursor: pointer; display: flex; flex-direction: column; gap: .2rem; position: absolute; transform: translate(-50%, -50%); }
.pin-ring { border-radius: 50%; height: 34px; position: absolute; width: 34px; }
.pin-body { align-items: center; border-radius: 50%; display: flex; height: 28px; justify-content: center; width: 28px; z-index: 1; }
.pin-icon { color: #fff; font-size: 16px; }
.pin-label { background: rgba(0,0,0,.6); border-radius: 4px; color: var(--text-primary); font-size: .65rem; padding: 1px 5px; white-space: nowrap; }
.pin-available .pin-body { background: var(--green); }
.pin-in-use .pin-body { background: var(--red); }
.pin-reserved .pin-body { background: var(--blue); }
.pin-maintenance .pin-body { background: var(--text-secondary); }
.pin-ghost .ghost-body { align-items: center; background: rgba(255,255,255,.15); border-radius: 50%; display: flex; height: 24px; justify-content: center; width: 24px; }
.pin-ghost .material-icons { color: #fff; font-size: 14px; }
.usage-chip { background: var(--accent); border-radius: 8px; color: #1a1200; font-size: .6rem; font-weight: 700; padding: 0 4px; }
.heat-blob { border-radius: 50%; filter: blur(18px); height: 90px; position: absolute; transform: translate(-50%, -50%); width: 90px; }
.floor-legend { display: flex; gap: 1rem; margin-top: .6rem; }
.legend-item { align-items: center; color: var(--text-secondary); display: flex; font-size: .75rem; gap: .35rem; }
.ldot { border-radius: 50%; height: 8px; width: 8px; }
.ldot-green { background: var(--green); } .ldot-red { background: var(--red); } .ldot-yellow { background: var(--accent); }
.all-gyms-title { font-size: 1rem; font-weight: 700; }
.all-gyms-sub { color: var(--text-secondary); font-size: .8rem; margin-bottom: 1rem; }
.gym-cards-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
.gym-card { cursor: pointer; padding: 1rem; }
.gym-card--active { outline: 2px solid var(--accent); }
.gym-card-top { align-items: center; display: flex; justify-content: space-between; margin-bottom: .5rem; }
.gym-card-name { align-items: center; display: flex; font-size: .88rem; font-weight: 600; gap: .3rem; }
.util-badge { background: var(--bg-base); border-radius: 6px; font-size: .75rem; padding: .1rem .5rem; }
.mini-map { background: var(--bg-base); border-radius: 8px; height: 120px; margin-bottom: .6rem; position: relative; overflow: hidden; }
.mini-pin { align-items: center; color: var(--text-primary); display: flex; position: absolute; transform: translate(-50%, -50%); }
.gym-card-stats { display: flex; font-size: .75rem; gap: .75rem; }
.gym-stat--green { color: var(--green); } .gym-stat--red { color: var(--red); }
.detail-backdrop { align-items: center; background: rgba(0,0,0,.5); bottom: 0; display: flex; justify-content: center; left: 0; position: fixed; right: 0; top: 0; z-index: 500; }
.detail-popup { max-width: 420px; padding: 1.25rem; width: 100%; }
.detail-header { align-items: flex-start; display: flex; justify-content: space-between; margin-bottom: .75rem; }
.detail-header-info { align-items: center; display: flex; gap: .6rem; }
.detail-icon-wrap { align-items: center; background: var(--bg-card); border-radius: 50%; display: flex; height: 40px; justify-content: center; width: 40px; }
.detail-name { font-size: 1rem; font-weight: 700; }
.detail-status-row { align-items: center; color: var(--text-secondary); display: flex; font-size: .78rem; gap: .3rem; }
.close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.detail-msg { color: var(--text-secondary); font-size: .85rem; margin-bottom: .5rem; }
.detail-actions { display: flex; flex-direction: column; gap: .5rem; }
.alt-list { display: flex; flex-direction: column; gap: .5rem; margin-bottom: 1rem; max-height: 220px; overflow-y: auto; }
.alt-item { align-items: center; background: var(--bg-card); border-radius: 8px; display: flex; justify-content: space-between; padding: .5rem .75rem; }
.toast { background: var(--bg-card); border: 1px solid var(--accent); border-radius: 8px; bottom: 1.5rem; box-shadow: 0 4px 16px rgba(0,0,0,.3); left: 50%; padding: .6rem 1rem; position: fixed; transform: translateX(-50%); z-index: 600; }
</style>
