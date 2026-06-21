<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMaintenanceStore } from '@/maintenance/application/maintenance.store.js';
import { useEquipmentStore }   from '@/equipment/application/equipment.store.js';

const { t }      = useI18n();
const store      = useMaintenanceStore();
const equipStore = useEquipmentStore();
const router     = useRouter();

const form = ref({ maintenanceId: '', equipmentId: '', description: '' });

async function submit() {
  if (!form.value.maintenanceId || !form.value.equipmentId || !form.value.description) return;
  await store.createTicket({
    maintenanceId: Number(form.value.maintenanceId),
    equipmentId:   Number(form.value.equipmentId),
    description:   form.value.description,
  });
  router.push('/maintenance');
}
</script>

<template>
  <div class="page">
    <div class="page__header" style="justify-content:flex-start;gap:.75rem">
      <button class="btn btn--icon" @click="router.back()"><span class="material-icons">arrow_back</span></button>
      <h1 class="page__title">{{ t('maintenance.form.title') }}</h1>
    </div>

    <div class="card form-wrap">
      <form class="form-grid" @submit.prevent="submit">
        <div class="form-field">
          <label>Maintenance ID</label>
          <input type="number" v-model="form.maintenanceId" placeholder="Maintenance ID" required />
        </div>
        <div class="form-field">
          <label>{{ t('maintenance.form.equipment') }}</label>
          <select v-model="form.equipmentId" required>
            <option disabled value="">— {{ t('maintenance.form.equipment') }} —</option>
            <option v-for="eq in equipStore.equipment" :key="eq.id" :value="eq.id">{{ eq.name }}</option>
          </select>
        </div>
        <div class="form-field form-field--full">
          <label>{{ t('maintenance.form.description') }}</label>
          <textarea v-model="form.description" rows="3" required></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn--outline" @click="router.push('/maintenance')">{{ t('maintenance.form.cancel') }}</button>
          <button type="submit" class="btn btn--primary" :disabled="store.loading">{{ t('maintenance.form.submit') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-wrap { max-width: 640px; }
.form-grid { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }
.form-field { display: flex; flex-direction: column; gap: .375rem; }
.form-field label { color: var(--text-secondary); font-size: .8rem; font-weight: 500; }
.form-field--full { grid-column: 1 / -1; }
.form-field textarea { resize: vertical; }
.form-actions { grid-column: 1 / -1; display: flex; gap: .75rem; justify-content: flex-end; }
</style>
