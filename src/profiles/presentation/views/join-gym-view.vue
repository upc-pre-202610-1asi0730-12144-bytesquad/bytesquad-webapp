<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useClientGymAssociationStore } from '@/profiles/application/client-gym-association.store.js';

const { t }      = useI18n();
const router     = useRouter();
const assocStore = useClientGymAssociationStore();

const selectedGymId = ref('');
const assocErrorMsg = ref(null);

const canSubmit = computed(() => !!selectedGymId.value);

onMounted(() => assocStore.loadAvailableGyms());

async function submit() {
  assocErrorMsg.value = null;
  try {
    await assocStore.associate(selectedGymId.value);
    router.push('/map');
  } catch (e) {
    assocErrorMsg.value = e.status === 403
      ? t('joinGym.error.notAuthorized')
      : (e.message || t('joinGym.error.generic'));
  }
}
</script>

<template>
  <div class="setup-page">
    <div class="setup-card">

      <div class="setup-header">
        <img src="/MOscuroSinBG.png" alt="SpotTrack" class="setup-logo" />
        <h1 class="setup-title">{{ t('joinGym.title') }}</h1>
        <p class="setup-sub">{{ t('joinGym.subtitle') }}</p>
      </div>

      <form class="setup-body" @submit.prevent="submit">

        <label class="field">
          <span class="field__label">{{ t('joinGym.gymLabel') }}</span>
          <div v-if="assocStore.gymsLoading" class="field-loading">
            <span class="material-icons spin">sync</span>
            {{ t('joinGym.loadingGyms') }}
          </div>
          <select v-else v-model="selectedGymId" required>
            <option value="" disabled>{{ t('joinGym.gymPlaceholder') }}</option>
            <option v-for="gym in assocStore.availableGyms" :key="gym.id" :value="gym.id">
              {{ gym.name }}
            </option>
          </select>
        </label>

        <div v-if="assocErrorMsg" class="error-banner">
          <span class="material-icons" style="font-size:18px">gpp_bad</span>
          {{ assocErrorMsg }}
        </div>

        <div v-if="assocStore.error && !assocErrorMsg" class="error-banner">
          <span class="material-icons" style="font-size:18px">error_outline</span>
          {{ assocStore.error }}
        </div>

        <button class="btn-submit" type="submit" :disabled="!canSubmit || assocStore.loading">
          <span v-if="assocStore.loading" class="material-icons spin" style="font-size:18px;vertical-align:middle">sync</span>
          <span v-else>{{ t('joinGym.submit') }}</span>
        </button>

      </form>
    </div>
  </div>
</template>

<style scoped>
.setup-page  { align-items: center; background: var(--bg-base); display: flex; justify-content: center; min-height: 100vh; padding: 1rem; }
.setup-card  { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; width: 100%; max-width: 440px; }
.setup-header { align-items: center; background: var(--bg-surface); border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.5rem; padding: 2rem 2rem 1.5rem; text-align: center; }
.setup-logo  { height: 48px; object-fit: contain; width: auto; }
.setup-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
.setup-sub   { color: var(--text-secondary); font-size: 0.875rem; margin: 0; max-width: 320px; }
.setup-body  { display: flex; flex-direction: column; gap: 1rem; padding: 1.75rem 2rem; }
.field        { display: flex; flex-direction: column; gap: 0.375rem; }
.field__label { color: var(--text-secondary); font-size: 0.8rem; font-weight: 500; }
select { appearance: none; background: var(--bg-surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 0.75rem center; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-primary); font-size: 0.9rem; padding: 0.625rem 2rem 0.625rem 0.75rem; width: 100%; }
select:focus { border-color: var(--accent); outline: none; }
.field-loading { align-items: center; color: var(--text-secondary); display: flex; font-size: 0.85rem; gap: 0.4rem; }
.error-banner { align-items: center; background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.4); border-radius: var(--radius); color: var(--red); display: flex; font-size: 0.85rem; gap: 0.5rem; padding: 0.625rem 0.875rem; }
.btn-submit  { background: var(--accent); border: none; border-radius: var(--radius); color: #000; cursor: pointer; font-size: 0.9rem; font-weight: 600; padding: 0.75rem; transition: opacity .2s; width: 100%; }
.btn-submit:disabled { cursor: not-allowed; opacity: 0.5; }
.btn-submit:not(:disabled):hover { opacity: 0.88; }
.spin { animation: spin 1s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
