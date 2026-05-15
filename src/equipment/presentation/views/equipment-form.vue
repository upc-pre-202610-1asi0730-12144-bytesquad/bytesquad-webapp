<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useEquipmentStore } from '@/equipment/application/equipment.store.js';
import { Equipment, EquipmentStatus } from '@/equipment/domain/model/equipment.entity.js';

const { t }  = useI18n();
const store  = useEquipmentStore();
const router = useRouter();
const route  = useRoute();

const isEdit = computed(() => !!route.params.id);

const form = ref({ id: null, zoneId: 1, name: '', brand: '', model: '', purchasePrice: 0, status: EquipmentStatus.OPERATIONAL });

onMounted(() => {
  if (isEdit.value) {
    const eq = store.equipment.find(e => e.id === Number(route.params.id));
    if (eq) Object.assign(form.value, { ...eq });
  }
});

async function submit() {
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
    <div class="page__header">
      <button class="btn btn--icon" @click="router.back()"><span class="material-icons">arrow_back</span></button>
      <h1 class="page__title">{{ isEdit ? t('equipment.editTitle') : t('equipment.addTitle') }}</h1>
    </div>

    <form class="card form-grid" @submit.prevent="submit">
      <div class="form-field">
        <label>{{ t('equipment.form.name') }}</label>
        <input v-model="form.name" required />
      </div>
      <div class="form-field">
        <label>{{ t('equipment.form.brand') }}</label>
        <input v-model="form.brand" />
      </div>
      <div class="form-field">
        <label>{{ t('equipment.form.model') }}</label>
        <input v-model="form.model" />
      </div>
      <div class="form-field">
        <label>{{ t('equipment.form.zone') }}</label>
        <input type="number" v-model.number="form.zoneId" min="1" />
      </div>
      <div class="form-field">
        <label>{{ t('equipment.form.price') }}</label>
        <input type="number" v-model.number="form.purchasePrice" min="0" step="0.01" />
      </div>
      <div class="form-field">
        <label>{{ t('equipment.form.status') }}</label>
        <select v-model="form.status">
          <option v-for="s in Object.values(EquipmentStatus)" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn--outline" @click="router.push('/equipment')">{{ t('common.cancel') }}</button>
        <button type="submit" class="btn btn--primary" :disabled="store.loading">{{ isEdit ? t('common.save') : t('common.create') }}</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-grid { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }
.form-field { display: flex; flex-direction: column; gap: 0.375rem; }
.form-field label { color: var(--text-secondary); font-size: 0.8rem; font-weight: 500; }
.form-actions { grid-column: 1 / -1; display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 0.5rem; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
