<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore }         from '@/authentication/application/auth.store.js';
import { useMaintenanceStore }  from '@/maintenance/application/maintenance.store.js';
import { useEquipmentStore }    from '@/gym/application/equipment.store.js';

const { t }      = useI18n();
const auth       = useAuthStore();
const store      = useMaintenanceStore();
const equipStore = useEquipmentStore();
const router     = useRouter();

const form      = ref({ equipmentId: '', description: '' });
const submitErr = ref('');

async function submit() {
  if (!form.value.equipmentId || !form.value.description) return;
  submitErr.value = '';
  try {
    await store.createTicketWithMaintenance({
      equipmentId:        Number(form.value.equipmentId),
      requestedByAdminId: auth.user?.id,
      description:        form.value.description,
    });
    router.push('/maintenance');
  } catch {
    submitErr.value = store.error || 'Something went wrong';
  }
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
        <div class="form-field form-field--full">
          <label>{{ t('maintenance.form.equipment') }}</label>
          <select v-model="form.equipmentId" required>
            <option disabled value="">— {{ t('maintenance.form.equipment') }} —</option>
            <option v-for="eq in equipStore.equipment" :key="eq.id" :value="eq.id">{{ eq.name }}</option>
          </select>
        </div>
        <div class="form-field form-field--full">
          <label>{{ t('maintenance.form.description') }}</label>
          <textarea v-model="form.description" rows="4" required></textarea>
        </div>
        <p v-if="submitErr" class="form-error">{{ submitErr }}</p>
        <div class="form-actions">
          <button type="button" class="btn btn--outline" @click="router.push('/maintenance')">{{ t('maintenance.form.cancel') }}</button>
          <button type="submit" class="btn btn--primary" :disabled="store.loading">
            {{ store.loading ? '…' : t('maintenance.form.submit') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-wrap  { max-width: 560px; }
.form-grid  { display: flex; flex-direction: column; gap: 1rem; }
.form-field { display: flex; flex-direction: column; gap: .375rem; }
.form-field label { color: var(--text-secondary); font-size: .8rem; font-weight: 500; }
.form-field textarea { resize: vertical; }
.form-error { color: var(--red); font-size: .8rem; }
.form-actions { display: flex; gap: .75rem; justify-content: flex-end; margin-top: .25rem; }
</style>
