<script setup>
import { useI18n } from 'vue-i18n';
import { useAuthStore }     from '@/auth/application/auth.store.js';
import { useProfilesStore } from '@/profiles/application/profiles.store.js';
import { gymState } from '@/shared/application/gym-state.service.js';
import { computed } from 'vue';

const { t } = useI18n();
const auth          = useAuthStore();
const profilesStore = useProfilesStore();

const availableCount = computed(() => gymState.machines.value.filter(m => m.status === 'AVAILABLE').length);
const reservedCount  = computed(() => gymState.machines.value.filter(m => m.status === 'RESERVED').length);
</script>

<template>
  <div class="page">
    <!-- Welcome banner -->
    <div class="welcome-banner card">
      <div class="welcome-text">
        <h1 class="welcome-title">{{ t('client.welcome') }}, {{ profilesStore.myProfile?.fullName ?? auth.user?.name ?? '' }}!</h1>
        <p class="welcome-sub">{{ t('client.subtitle') }}</p>
      </div>
      <span class="material-icons welcome-icon">directions_run</span>
    </div>

    <!-- Live status row -->
    <div class="status-row">
      <div class="card status-card status-card--green">
        <span class="material-icons status-icon">check_circle</span>
        <div>
          <p class="status-val">{{ availableCount }}</p>
          <p class="status-label">Máquinas Libres</p>
        </div>
      </div>
      <div class="card status-card status-card--amber">
        <span class="material-icons status-icon">event_busy</span>
        <div>
          <p class="status-val">{{ reservedCount }}</p>
          <p class="status-label">Reservadas</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-banner { align-items: center; background: linear-gradient(135deg, rgba(245,188,54,.12), rgba(0,204,178,.07)); display: flex; justify-content: space-between; margin-bottom: 1rem; padding: 1.5rem; }
.welcome-title { font-size: 1.2rem; font-weight: 700; }
.welcome-sub  { color: var(--text-secondary); font-size: .85rem; margin-top: .35rem; max-width: 340px; }
.welcome-icon { color: var(--accent); font-size: 48px; opacity: .4; }
.status-row { display: grid; gap: .75rem; grid-template-columns: 1fr 1fr; }
.status-card { align-items: center; display: flex; gap: .75rem; }
.status-card--green .status-icon { color: var(--green); font-size: 28px; }
.status-card--amber .status-icon { color: var(--accent); font-size: 28px; }
.status-val   { font-size: 1.6rem; font-weight: 700; }
.status-label { color: var(--text-secondary); font-size: .78rem; }
</style>
