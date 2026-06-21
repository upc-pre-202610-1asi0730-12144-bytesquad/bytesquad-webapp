<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMaintenanceStore } from '@/maintenance/application/maintenance.store.js';
import { useEquipmentStore } from '@/gym/application/equipment.store.js';
import { TicketPriority, TicketType } from '@/maintenance/domain/model/maintenance-ticket.entity.js';

const { t }      = useI18n();
const store      = useMaintenanceStore();
const equipStore = useEquipmentStore();
const router     = useRouter();

const form = ref({ equipmentId: null, description: '', priority: TicketPriority.MEDIUM, type: TicketType.CORRECTIVE, date: '', time: '10:00' });

const isPeak   = computed(() => store.isPeakHour(form.value.time));
const peakWarn = computed(() => isPeak.value);

function applySuggestion(t) { form.value.time = t; }

function submit() {
  if (!form.value.equipmentId) return;
  store.createTicket(Number(form.value.equipmentId), form.value.description, form.value.priority, form.value.type);
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
      <div v-if="peakWarn" class="peak-warn">
        <span class="material-icons">schedule</span>
        {{ t('maintenance.scheduler.peakHint') }}
        <div class="suggestions">
          <button v-for="s in store.OFF_PEAK_SUGGESTIONS" :key="s" class="chip" @click="applySuggestion(s)">{{ s }}</button>
        </div>
      </div>

      <form class="form-grid" @submit.prevent="submit">
        <div class="form-field">
          <label>{{ t('maintenance.form.equipment') }}</label>
          <select v-model="form.equipmentId" required>
            <option disabled value="">— {{ t('maintenance.form.equipment') }} —</option>
            <option v-for="eq in equipStore.equipment" :key="eq.id" :value="eq.id">{{ eq.name }}</option>
          </select>
        </div>
        <div class="form-field">
          <label>{{ t('maintenance.form.priority') }}</label>
          <select v-model="form.priority">
            <option v-for="p in Object.values(TicketPriority)" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div class="form-field">
          <label>{{ t('maintenance.form.type') }}</label>
          <select v-model="form.type">
            <option v-for="tp in Object.values(TicketType)" :key="tp" :value="tp">{{ tp }}</option>
          </select>
        </div>
        <div class="form-field">
          <label>{{ t('maintenance.form.time') }}</label>
          <input type="time" v-model="form.time" />
        </div>
        <div class="form-field form-field--full">
          <label>{{ t('maintenance.form.description') }}</label>
          <textarea v-model="form.description" rows="3" required></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn--outline" @click="router.push('/maintenance')">{{ t('maintenance.form.cancel') }}</button>
          <button type="submit" class="btn btn--primary">{{ t('maintenance.form.submit') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-wrap { max-width: 640px; }
.peak-warn { align-items: flex-start; background: rgba(245,188,54,.1); border: 1px solid var(--accent); border-radius: 8px; display: flex; flex-direction: column; font-size: .85rem; gap: .5rem; margin-bottom: 1rem; padding: .75rem 1rem; }
.suggestions { display: flex; gap: .5rem; flex-wrap: wrap; }
.chip { background: var(--bg-surface); border: 1px solid var(--accent); border-radius: 999px; color: var(--accent); cursor: pointer; font-size: .75rem; padding: 2px 10px; }
.form-grid { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }
.form-field { display: flex; flex-direction: column; gap: .375rem; }
.form-field label { color: var(--text-secondary); font-size: .8rem; font-weight: 500; }
.form-field--full { grid-column: 1 / -1; }
.form-field textarea { resize: vertical; }
.form-actions { grid-column: 1 / -1; display: flex; gap: .75rem; justify-content: flex-end; }
</style>
