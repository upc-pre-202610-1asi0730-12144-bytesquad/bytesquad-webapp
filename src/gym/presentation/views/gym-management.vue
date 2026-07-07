<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGymStore } from '@/gym/application/gym.store.js';

const store = useGymStore();
const gymId = computed(() => store.currentGym?.id);

// ── Branch form ────────────────────────────────────────────────────────────
const branchForm = ref({ name: '', street: '', district: '', city: '' });

async function submitBranch() {
  const created = await store.addBranch(gymId.value, { ...branchForm.value });
  if (created) branchForm.value = { name: '', street: '', district: '', city: '' };
}

// ── Branch expansion ───────────────────────────────────────────────────────
const expanded    = ref({});
const zoneInputs  = ref({});

function toggleBranch(branch) {
  const id        = branch.id;
  const wasOpen   = !!expanded.value[id];
  expanded.value  = { ...expanded.value, [id]: !wasOpen };
  if (!wasOpen) {
    if (zoneInputs.value[id] === undefined) zoneInputs.value[id] = { name: '', maximumOccupancy: '' };
    if (store.zonesMap[id] === undefined)   store.loadZonesForBranch(gymId.value, id);
  }
}

// ── Zone form ──────────────────────────────────────────────────────────────
async function submitZone(branchId) {
  const input = zoneInputs.value[branchId] || {};
  const name = (input.name || '').trim();
  const maximumOccupancy = Number(input.maximumOccupancy);
  if (!name || !maximumOccupancy || maximumOccupancy <= 0) return;
  const created = await store.addZone(gymId.value, branchId, { name, maximumOccupancy });
  if (created) zoneInputs.value[branchId] = { name: '', maximumOccupancy: '' };
}

onMounted(() => {
  if (gymId.value) store.loadBranches(gymId.value);
});
</script>

<template>
  <div class="page">

    <div class="page__header">
      <div>
        <h1 class="page__title">Branch Management</h1>
        <p class="page__subtitle" v-if="store.currentGym?.name">{{ store.currentGym.name }}</p>
      </div>
    </div>

    <div v-if="store.error" class="alert alert--error">{{ store.error }}</div>

    <!-- Add Branch -->
    <div class="card section">
      <h2 class="section-title">Add Branch</h2>
      <form class="form-grid" @submit.prevent="submitBranch">
        <div class="form-field">
          <label>Name</label>
          <input v-model="branchForm.name" placeholder="e.g. Main Branch" required :disabled="store.loading" />
        </div>
        <div class="form-field">
          <label>Street</label>
          <input v-model="branchForm.street" placeholder="e.g. Av. Javier Prado 1234" required :disabled="store.loading" />
        </div>
        <div class="form-field">
          <label>District</label>
          <input v-model="branchForm.district" placeholder="e.g. San Isidro" required :disabled="store.loading" />
        </div>
        <div class="form-field">
          <label>City</label>
          <input v-model="branchForm.city" placeholder="e.g. Lima" required :disabled="store.loading" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn--primary" :disabled="store.loading">
            <span class="material-icons btn__icon">add_location_alt</span>
            Add Branch
          </button>
        </div>
      </form>
    </div>

    <!-- Branch list -->
    <div class="card" style="padding:0;overflow:hidden">

      <!-- Loading skeleton -->
      <div v-if="store.loading && store.branches.length === 0" class="skeleton-wrap">
        <div v-for="i in 3" :key="i" class="skeleton-row">
          <div class="skeleton skeleton--line" />
          <div class="skeleton skeleton--line-short" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!store.loading && store.branches.length === 0" class="empty-state">
        <span class="material-icons" style="font-size:36px;color:var(--text-secondary)">store</span>
        <p style="color:var(--text-secondary);font-size:.85rem">No branches yet. Add the first one above.</p>
      </div>

      <!-- Branch rows -->
      <div v-else>
        <div
          v-for="branch in store.branches"
          :key="branch.id"
          class="branch-item"
        >
          <!-- Branch header (clickable) -->
          <button class="branch-header" @click="toggleBranch(branch)">
            <span class="material-icons chevron" :class="{ 'chevron--open': expanded[branch.id] }">
              chevron_right
            </span>
            <div class="branch-info">
              <span class="branch-name">{{ branch.name }}</span>
              <span class="branch-addr">{{ branch.street }}, {{ branch.district }}, {{ branch.city }}</span>
            </div>
            <span class="branch-badge" v-if="store.zonesMap[branch.id]?.length">
              {{ store.zonesMap[branch.id].length }} zone{{ store.zonesMap[branch.id].length !== 1 ? 's' : '' }}
            </span>
          </button>

          <!-- Zones panel -->
          <div v-if="expanded[branch.id]" class="zones-panel">

            <!-- Zone loading skeleton -->
            <div v-if="store.zonesLoadingMap[branch.id]" class="zone-skeleton-wrap">
              <div v-for="i in 2" :key="i" class="skeleton skeleton--zone" />
            </div>

            <!-- Zone list -->
            <ul v-else-if="store.zonesMap[branch.id]?.length" class="zone-list">
              <li v-for="zone in store.zonesMap[branch.id]" :key="zone.id" class="zone-item">
                <span class="material-icons" style="font-size:14px;color:var(--text-secondary)">my_location</span>
                {{ zone.name }}
              </li>
            </ul>

            <!-- Zone empty state -->
            <p v-else-if="store.zonesMap[branch.id] !== undefined && !store.zonesLoadingMap[branch.id]"
               class="zone-empty">
              No zones yet.
            </p>

            <!-- Add zone row -->
            <div class="zone-add-row">
              <input
                :value="zoneInputs[branch.id]?.name"
                @input="zoneInputs[branch.id] = { ...zoneInputs[branch.id], name: $event.target.value }"
                placeholder="Zone name (e.g. Cardio)"
                @keydown.enter.prevent="submitZone(branch.id)"
                :disabled="store.loading"
              />
              <input
                type="number" min="1" style="width:6rem"
                :value="zoneInputs[branch.id]?.maximumOccupancy"
                @input="zoneInputs[branch.id] = { ...zoneInputs[branch.id], maximumOccupancy: $event.target.value }"
                placeholder="Max. aforo"
                @keydown.enter.prevent="submitZone(branch.id)"
                :disabled="store.loading"
              />
              <button
                class="btn btn--primary btn--sm"
                :disabled="store.loading || !zoneInputs[branch.id]?.name?.trim() || !zoneInputs[branch.id]?.maximumOccupancy"
                @click="submitZone(branch.id)"
              >
                <span class="material-icons btn__icon" style="font-size:14px">add</span>
                Add Zone
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.page__header  { margin-bottom: 1.25rem; }
.page__subtitle { color: var(--text-secondary); font-size: .8rem; margin-top: .15rem; }

/* Alert */
.alert { border-radius: var(--radius); font-size: .8rem; margin-bottom: 1rem; padding: .5rem .75rem; }
.alert--error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: var(--red); }

/* Add Branch form */
.section       { margin-bottom: 1rem; }
.section-title { font-size: .9rem; font-weight: 600; margin-bottom: .875rem; }
.form-grid     { display: grid; gap: .875rem; grid-template-columns: 1fr 1fr; }
.form-field    { display: flex; flex-direction: column; gap: .375rem; }
.form-field label { color: var(--text-secondary); font-size: .8rem; font-weight: 500; }
.form-actions  { grid-column: 1 / -1; display: flex; justify-content: flex-end; padding-top: .25rem; }
.btn__icon     { font-size: 15px; margin-right: 3px; vertical-align: middle; }

/* Branch list */
.branch-item   { border-bottom: 1px solid rgba(255,255,255,.05); }
.branch-item:last-child { border-bottom: none; }

.branch-header {
  align-items: center;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  gap: .625rem;
  padding: .75rem 1rem;
  text-align: left;
  transition: background .12s;
  width: 100%;
}
.branch-header:hover { background: var(--bg-surface); }

.chevron        { color: var(--text-secondary); font-size: 18px; flex-shrink: 0; transition: transform .18s; }
.chevron--open  { transform: rotate(90deg); }

.branch-info    { display: flex; flex-direction: column; flex: 1; gap: .15rem; min-width: 0; }
.branch-name    { font-size: .875rem; font-weight: 600; }
.branch-addr    { color: var(--text-secondary); font-size: .78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.branch-badge {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--text-secondary);
  flex-shrink: 0;
  font-size: .72rem;
  padding: .15rem .55rem;
}

/* Zones panel */
.zones-panel {
  background: var(--bg-base);
  border-top: 1px solid rgba(255,255,255,.05);
  padding: .75rem 1rem .75rem 2.75rem;
}

.zone-list    { list-style: none; margin: 0 0 .625rem; padding: 0; display: flex; flex-direction: column; gap: .35rem; }
.zone-item    { align-items: center; color: var(--text-primary); display: flex; font-size: .84rem; gap: .4rem; }
.zone-empty   { color: var(--text-secondary); font-size: .8rem; margin-bottom: .625rem; }

.zone-add-row { display: flex; gap: .5rem; }
.zone-add-row input { flex: 1; font-size: .84rem; }
.btn--sm      { font-size: .78rem; padding: .3rem .75rem; }

/* Skeletons */
.skeleton-wrap { padding: .5rem 1rem; }
.skeleton-row  { display: flex; flex-direction: column; gap: .35rem; padding: .6rem 0; border-bottom: 1px solid rgba(255,255,255,.04); }
.skeleton      { animation: pulse 1.4s ease-in-out infinite; background: var(--border); border-radius: 4px; }
.skeleton--line      { height: 13px; width: 40%; }
.skeleton--line-short { height: 11px; width: 60%; }
.zone-skeleton-wrap  { display: flex; flex-direction: column; gap: .35rem; margin-bottom: .625rem; }
.skeleton--zone      { height: 12px; width: 30%; }
@keyframes pulse { 0%,100% { opacity: .5; } 50% { opacity: 1; } }

/* Empty state */
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .75rem; padding: 2.5rem; text-align: center; }

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
  .zones-panel { padding-left: 1rem; }
}
</style>
