<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGymStore } from '@/gym/application/gym.store.js';

const router   = useRouter();
const gymStore = useGymStore();

const gymName = ref('');

async function submit() {
  const created = await gymStore.addGym({ name: gymName.value.trim() });
  if (created) router.push('/dashboard');
}
</script>

<template>
  <div class="setup-page">
    <div class="setup-card">

      <div class="setup-header">
        <img src="/MOscuroSinBG.png" alt="SpotTrack" class="setup-logo" />
        <h1 class="setup-title">Welcome to SpotTrack</h1>
        <p class="setup-sub">Before you start, let's set up your gym.</p>
      </div>

      <form class="setup-body" @submit.prevent="submit">
        <label class="field">
          <span class="field__label">Gym name</span>
          <input
            v-model="gymName"
            type="text"
            placeholder="e.g. FitLife Gym"
            required
            autofocus
          />
        </label>

        <div v-if="gymStore.error" class="error-banner">
          <span class="material-icons" style="font-size:18px">error_outline</span>
          {{ gymStore.error }}
        </div>

        <button class="btn-submit" type="submit" :disabled="gymStore.loading || !gymName.trim()">
          <span v-if="gymStore.loading" class="material-icons spin" style="font-size:18px;vertical-align:middle">sync</span>
          <span v-else>Create Gym</span>
        </button>
      </form>

    </div>
  </div>
</template>

<style scoped>
.setup-page {
  align-items: center;
  background: var(--bg-base);
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.setup-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
  max-width: 420px;
}

.setup-header {
  align-items: center;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 2rem 2rem 1.5rem;
  text-align: center;
}

.setup-logo  { height: 48px; object-fit: contain; width: auto; }
.setup-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
.setup-sub   { color: var(--text-secondary); font-size: 0.875rem; margin: 0; }

.setup-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.75rem 2rem;
}

.field        { display: flex; flex-direction: column; gap: 0.375rem; }
.field__label { color: var(--text-secondary); font-size: 0.8rem; font-weight: 500; }

.error-banner {
  align-items: center;
  background: rgba(239,68,68,.1);
  border: 1px solid rgba(239,68,68,.4);
  border-radius: var(--radius);
  color: var(--red);
  display: flex;
  font-size: 0.85rem;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
}

.btn-submit {
  background: var(--accent);
  border: none;
  border-radius: var(--radius);
  color: #000;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.75rem;
  transition: opacity .2s;
  width: 100%;
}
.btn-submit:disabled { cursor: not-allowed; opacity: 0.5; }
.btn-submit:not(:disabled):hover { opacity: 0.88; }

.spin { animation: spin 1s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
