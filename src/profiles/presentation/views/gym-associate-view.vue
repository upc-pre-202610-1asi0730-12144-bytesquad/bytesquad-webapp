<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useGymStore } from '@/gym/application/gym.store.js';
import { useActiveGymStore } from '@/profiles/application/active-gym.store.js';

const { t } = useI18n();
const router = useRouter();
const gymStore = useGymStore();
const activeGymStore = useActiveGymStore();

// Snapshot at entry: true means the client has no active gym yet, so after
// the first successful join we send them straight to /map.
const redirectAfterJoin = activeGymStore.hasNoActiveGym;

onMounted(() => {
  gymStore.loadGyms();
  activeGymStore.loadAssociations();
});

function isJoined(gymId) {
  return activeGymStore.associations.some(a => a.gymId === gymId);
}

async function joinGym(gymId) {
  await activeGymStore.associateGym(gymId);
  if (redirectAfterJoin) router.push('/map');
}
</script>

<template>
  <div class="page">
    <div class="gym-associate__header">
      <span class="material-icons gym-associate__icon">fitness_center</span>
      <h1 class="page__title">{{ t('gymAssociate.title') }}</h1>
      <p class="page__subtitle">{{ t('gymAssociate.subtitle') }}</p>
    </div>

    <div v-if="activeGymStore.error" class="empty-state card">
      <span class="material-icons empty-icon">error_outline</span>
      <p class="empty-title">{{ activeGymStore.error }}</p>
    </div>

    <div v-if="gymStore.error" class="empty-state card">
      <span class="material-icons empty-icon">error_outline</span>
      <p class="empty-title">{{ gymStore.error }}</p>
    </div>

    <div v-if="gymStore.loading" class="empty-state card">
      <span class="material-icons empty-icon spin">autorenew</span>
    </div>
    <p v-else-if="!gymStore.gyms.length && !gymStore.error" class="empty-title">
      {{ t('gymAssociate.noGyms') }}
    </p>

    <ul v-else class="gym-list">
      <li v-for="gym in gymStore.gyms" :key="gym.id" class="card gym-item">
        <div class="gym-item__info">
          <span class="material-icons gym-icon">storefront</span>
          <span class="gym-name">{{ gym.name }}</span>
        </div>
        <span v-if="isJoined(gym.id)" class="badge badge--green">
          <span class="material-icons" style="font-size:14px">check_circle</span>
          {{ t('gymAssociate.alreadyJoined') }}
        </span>
        <button v-else class="btn btn--outline" :disabled="activeGymStore.loading" @click="joinGym(gym.id)">
          {{ t('gymAssociate.joinBtn') }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.gym-associate__header { align-items: center; display: flex; flex-direction: column; margin-bottom: 1.5rem; text-align: center; }
.gym-associate__icon { color: var(--accent); font-size: 40px; margin-bottom: .5rem; }
.page__subtitle { color: var(--text-secondary); font-size: .85rem; margin-top: .25rem; }
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .5rem; padding: 2.5rem; text-align: center; }
.empty-icon { color: var(--text-secondary); font-size: 48px; }
.empty-icon.spin { animation: spin 1s linear infinite; }
.empty-title { color: var(--text-secondary); font-size: .95rem; font-weight: 600; text-align: center; }
.gym-list { display: flex; flex-direction: column; gap: .6rem; list-style: none; margin: 0; padding: 0; }
.gym-item { align-items: center; display: flex; justify-content: space-between; padding: 1rem 1.25rem; }
.gym-item__info { align-items: center; display: flex; gap: .75rem; }
.gym-icon { color: var(--accent); font-size: 24px; }
.gym-name { font-weight: 600; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
