<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useProfilesStore } from '@/profiles/application/profiles.store.js';

const { t }         = useI18n();
const router        = useRouter();
const profilesStore = useProfilesStore();

const form = ref({ firstName: '', lastName: '', phoneNumber: '', dni: '' });

onMounted(async () => {
  if (!profilesStore.profileChecked) await profilesStore.loadMyProfile();
  const p = profilesStore.myProfile;
  if (p) {
    form.value = {
      firstName:   p.firstName   ?? '',
      lastName:    p.lastName    ?? '',
      phoneNumber: p.phoneNumber ?? '',
      dni:         p.dni         ?? '',
    };
  }
});

async function submit() {
  await profilesStore.updateMyProfile(form.value);
  if (!profilesStore.error) router.push('/join-gym');
}
</script>

<template>
  <div class="setup-page">
    <div class="setup-card">

      <div class="setup-header">
        <img src="/MOscuroSinBG.png" alt="SpotTrack" class="setup-logo" />
        <h1 class="setup-title">{{ t('completeProfile.title') }}</h1>
        <p class="setup-sub">{{ t('completeProfile.subtitle') }}</p>
      </div>

      <form class="setup-body" @submit.prevent="submit">

        <label class="field">
          <span class="field__label">{{ t('completeProfile.firstName') }}</span>
          <input v-model="form.firstName" type="text" required autofocus />
        </label>

        <label class="field">
          <span class="field__label">{{ t('completeProfile.lastName') }}</span>
          <input v-model="form.lastName" type="text" required />
        </label>

        <label class="field">
          <span class="field__label">{{ t('completeProfile.phone') }}</span>
          <input v-model="form.phoneNumber" type="tel" />
        </label>

        <label class="field">
          <span class="field__label">{{ t('completeProfile.dni') }}</span>
          <input v-model="form.dni" type="text" :placeholder="t('completeProfile.dniPlaceholder')" required />
          <span class="field__hint">{{ t('completeProfile.dniHint') }}</span>
        </label>

        <div v-if="profilesStore.error" class="error-banner">
          <span class="material-icons" style="font-size:18px">error_outline</span>
          {{ profilesStore.error }}
        </div>

        <button
          class="btn-submit"
          type="submit"
          :disabled="profilesStore.loading || !form.firstName.trim() || !form.lastName.trim() || !form.dni.trim()"
        >
          <span v-if="profilesStore.loading" class="material-icons spin" style="font-size:18px;vertical-align:middle">sync</span>
          <span v-else>{{ t('completeProfile.submit') }}</span>
        </button>

      </form>
    </div>
  </div>
</template>

<style scoped>
.setup-page  { align-items: center; background: var(--bg-base); display: flex; justify-content: center; min-height: 100vh; padding: 1rem; }
.setup-card  { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; width: 100%; max-width: 420px; }
.setup-header { align-items: center; background: var(--bg-surface); border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.5rem; padding: 2rem 2rem 1.5rem; text-align: center; }
.setup-logo  { height: 48px; object-fit: contain; width: auto; }
.setup-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
.setup-sub   { color: var(--text-secondary); font-size: 0.875rem; margin: 0; }
.setup-body  { display: flex; flex-direction: column; gap: 1rem; padding: 1.75rem 2rem; }
.field        { display: flex; flex-direction: column; gap: 0.375rem; }
.field__label { color: var(--text-secondary); font-size: 0.8rem; font-weight: 500; }
.field__hint  { color: var(--text-secondary); font-size: 0.75rem; }
.error-banner { align-items: center; background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.4); border-radius: var(--radius); color: var(--red); display: flex; font-size: 0.85rem; gap: 0.5rem; padding: 0.625rem 0.875rem; }
.btn-submit  { background: var(--accent); border: none; border-radius: var(--radius); color: #000; cursor: pointer; font-size: 0.9rem; font-weight: 600; padding: 0.75rem; transition: opacity .2s; width: 100%; }
.btn-submit:disabled { cursor: not-allowed; opacity: 0.5; }
.btn-submit:not(:disabled):hover { opacity: 0.88; }
.spin { animation: spin 1s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
