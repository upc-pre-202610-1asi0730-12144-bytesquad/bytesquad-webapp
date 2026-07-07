<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGymStore } from '@/gym/application/gym.store.js';

const { t } = useI18n();
const store = useGymStore();

const activeTab = ref('gym');

const gymForm    = ref({ name: '' });
const branchForm = ref({ gymId: '', name: '', street: '', district: '', city: '' });
const zoneForm   = ref({ gymId: '', branchId: '', name: '' });

async function submitGym() {
  await store.addGym({ ...gymForm.value });
  gymForm.value = { name: '' };
}

async function submitBranch() {
  await store.addBranch(Number(branchForm.value.gymId), {
    name: branchForm.value.name,
    street: branchForm.value.street,
    district: branchForm.value.district,
    city: branchForm.value.city,
  });
  branchForm.value = { gymId: '', name: '', street: '', district: '', city: '' };
}

async function submitZone() {
  await store.addZone(Number(zoneForm.value.gymId), Number(zoneForm.value.branchId), {
    name: zoneForm.value.name,
  });
  zoneForm.value = { gymId: '', branchId: '', name: '' };
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">Gym Management</h1>
    </div>

    <div class="tabs">
      <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'gym' }"    @click="activeTab = 'gym'">Gym</button>
      <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'branch' }" @click="activeTab = 'branch'">Branch</button>
      <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'zone' }"   @click="activeTab = 'zone'">Zone</button>
    </div>

    <div v-if="store.error" class="error-banner card">{{ store.error }}</div>

    <!-- Gym form -->
    <form v-if="activeTab === 'gym'" class="card form-grid" @submit.prevent="submitGym">
      <h2 class="form-title">Create Gym</h2>
      <div class="form-field"><label>Name</label><input v-model="gymForm.name" required /></div>
      <div class="form-actions">
        <button type="submit" class="btn btn--primary" :disabled="store.loading">Create Gym</button>
      </div>
    </form>

    <!-- Branch form -->
    <form v-if="activeTab === 'branch'" class="card form-grid" @submit.prevent="submitBranch">
      <h2 class="form-title">Add Branch to Gym</h2>
      <div class="form-field"><label>Gym ID</label><input type="number" v-model.number="branchForm.gymId" required /></div>
      <div class="form-field"><label>Name</label><input v-model="branchForm.name" required /></div>
      <div class="form-field"><label>Street</label><input v-model="branchForm.street" required /></div>
      <div class="form-field"><label>District</label><input v-model="branchForm.district" required /></div>
      <div class="form-field"><label>City</label><input v-model="branchForm.city" required /></div>
      <div class="form-actions">
        <button type="submit" class="btn btn--primary" :disabled="store.loading">Add Branch</button>
      </div>
    </form>

    <!-- Zone form -->
    <form v-if="activeTab === 'zone'" class="card form-grid" @submit.prevent="submitZone">
      <h2 class="form-title">Add Zone to Branch</h2>
      <div class="form-field"><label>Gym ID</label><input type="number" v-model.number="zoneForm.gymId" required /></div>
      <div class="form-field"><label>Branch ID</label><input type="number" v-model.number="zoneForm.branchId" required /></div>
      <div class="form-field"><label>Name</label><input v-model="zoneForm.name" required /></div>
      <div class="form-actions">
        <button type="submit" class="btn btn--primary" :disabled="store.loading">Add Zone</button>
      </div>
    </form>

    <!-- Created this session (mock list, no GET from backend yet) -->
    <div v-if="store.gyms.length || store.branches.length || store.zones.length" class="card results">
      <p v-if="store.gyms.length" class="result-label">Gyms created this session: {{ store.gyms.map(g => g.name).join(', ') }}</p>
      <p v-if="store.branches.length" class="result-label">Branches: {{ store.branches.map(b => b.name).join(', ') }}</p>
      <p v-if="store.zones.length" class="result-label">Zones: {{ store.zones.map(z => z.name).join(', ') }}</p>
    </div>
  </div>
</template>

<style scoped>
.tabs { display: flex; gap: .5rem; margin-bottom: 1rem; }
.tab-btn { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 20px; color: var(--text-secondary); cursor: pointer; font-size: .8rem; padding: .3rem .9rem; transition: all .15s; }
.tab-btn--active { background: var(--accent); border-color: var(--accent); color: #000; font-weight: 600; }
.form-grid { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }
.form-title { color: var(--text-primary); font-size: .95rem; font-weight: 600; grid-column: 1 / -1; margin: 0; }
.form-field { display: flex; flex-direction: column; gap: .375rem; }
.form-field label { color: var(--text-secondary); font-size: .8rem; font-weight: 500; }
.form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; padding-top: .5rem; }
.error-banner { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: var(--red); font-size: .85rem; margin-bottom: 1rem; padding: .75rem; }
.results { margin-top: 1rem; }
.result-label { color: var(--text-secondary); font-size: .85rem; margin: .25rem 0; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
