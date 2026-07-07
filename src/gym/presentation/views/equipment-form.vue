<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useEquipmentStore } from '@/gym/application/equipment.store.js';
import { useGymStore }        from '@/gym/application/gym.store.js';
import { Equipment, EquipmentStatus } from '@/gym/domain/model/equipment.entity.js';

const { t }  = useI18n();
const store  = useEquipmentStore();
const gymStore = useGymStore();
const router = useRouter();
const route  = useRoute();

const isEdit = computed(() => !!route.params.id);
const gymId  = computed(() => gymStore.currentGym?.id);

const form = ref({
  id: null, zoneId: null, name: '', status: EquipmentStatus.OPERATIONAL, purchasePrice: null,
});

// ── Branch / Zone cascade ──────────────────────────────────────────────────
const selectedBranchId = ref(null);

const availableZones = computed(() =>
  selectedBranchId.value ? (gymStore.zonesMap[selectedBranchId.value] ?? []) : []
);

watch(selectedBranchId, (branchId) => {
  form.value.zoneId = null;
  if (branchId && gymStore.zonesMap[branchId] === undefined) {
    gymStore.loadZones(gymId.value, branchId);
  }
});

onMounted(async () => {
  if (!gymId.value) return;

  if (!gymStore.branches.length) {
    await gymStore.loadBranches(gymId.value);
  }

  if (isEdit.value) {
    const eq = store.equipment.find(e => e.id === Number(route.params.id));
    if (eq) {
      Object.assign(form.value, { id: eq.id, name: eq.name, zoneId: eq.zoneId, status: eq.status, purchasePrice: eq.purchasePrice });

      // pre-load all branch zones to find which branch owns this zone
      await Promise.all(
        gymStore.branches
          .filter(b => gymStore.zonesMap[b.id] === undefined)
          .map(b => gymStore.loadZones(gymId.value, b.id))
      );

      for (const branch of gymStore.branches) {
        if ((gymStore.zonesMap[branch.id] ?? []).some(z => z.id === eq.zoneId)) {
          selectedBranchId.value = branch.id;
          break;
        }
      }
    }
  }
});

async function submit() {
  if (!form.value.zoneId) return;
  const entity = new Equipment(form.value);
  if (isEdit.value) {
    await store.updateEquipment(entity);
  } else {
    await store.addEquipment(entity);
  }
  router.push('/equipment');
}
</script>

<template>
  <div class="page">
    <div class="page__header" style="justify-content:flex-start;gap:.75rem">
      <button class="btn btn--icon" @click="router.back()"><span class="material-icons">arrow_back</span></button>
      <h1 class="page__title">{{ isEdit ? t('equipment.dialog.editTitle') : t('equipment.dialog.addTitle') }}</h1>
    </div>

    <form class="card form-grid" @submit.prevent="submit">

      <div class="form-field">
        <label>{{ t('equipment.dialog.fields.name') }}</label>
        <input v-model="form.name" required :disabled="store.loading" />
      </div>

      <div class="form-field">
        <label>{{ t('equipment.dialog.fields.status') }}</label>
        <select v-model="form.status" :disabled="store.loading">
          <option v-for="s in Object.values(EquipmentStatus)" :key="s" :value="s">{{ t(`equipment.status.${s}`) || s }}</option>
        </select>
      </div>

      <div class="form-field">
        <label>{{ t('equipment.dialog.fields.purchasePrice') }}</label>
        <input v-model.number="form.purchasePrice" type="number" min="0" step="0.01"
               placeholder="e.g. 1200.00"
               :disabled="store.loading" />
      </div>

      <!-- Branch selector -->
      <div class="form-field">
        <label>Branch</label>
        <select v-model="selectedBranchId" required :disabled="store.loading || !gymStore.branches.length">
          <option :value="null" disabled>{{ gymStore.branches.length ? 'Select branch…' : 'Loading branches…' }}</option>
          <option v-for="b in gymStore.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>

      <!-- Zone selector (depends on branch) -->
      <div class="form-field">
        <label>{{ t('equipment.dialog.fields.zoneId') }}</label>
        <select v-model="form.zoneId" required
          :disabled="store.loading || !selectedBranchId || gymStore.zonesLoadingMap[selectedBranchId]">
          <option :value="null" disabled>
            <template v-if="!selectedBranchId">Select branch first</template>
            <template v-else-if="gymStore.zonesLoadingMap[selectedBranchId]">Loading zones…</template>
            <template v-else-if="!availableZones.length">No zones in this branch</template>
            <template v-else>Select zone…</template>
          </option>
          <option v-for="z in availableZones" :key="z.id" :value="z.id">{{ z.name }}</option>
        </select>
      </div>

      <div v-if="store.error" class="alert alert--error" style="grid-column:1/-1">{{ store.error }}</div>

      <div class="form-actions">
        <button type="button" class="btn btn--outline" @click="router.push('/equipment')">{{ t('equipment.actions.cancel') }}</button>
        <button type="submit" class="btn btn--primary"
          :disabled="store.loading || !form.zoneId">
          {{ isEdit ? t('equipment.actions.save') : t('equipment.actions.register') }}
        </button>
      </div>

    </form>
  </div>
</template>

<style scoped>
.form-grid  { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }
.form-field { display: flex; flex-direction: column; gap: 0.375rem; }
.form-field label { color: var(--text-secondary); font-size: 0.8rem; font-weight: 500; }
.form-actions { grid-column: 1 / -1; display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 0.5rem; }
.alert { border-radius: var(--radius); font-size: .8rem; padding: .5rem .75rem; }
.alert--error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: var(--red); }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
