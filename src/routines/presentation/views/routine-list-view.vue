<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoutineStore } from '@/routines/application/routine.store.js';
import { useRoutineSessionStore } from '@/routines/application/routine-session.store.js';

const { t } = useI18n();
const routineStore = useRoutineStore();
const sessionStore  = useRoutineSessionStore();

const searchQuery = ref('');
const showModal   = ref(false);
const newName     = ref('');

onMounted(() => {
  routineStore.loadAll();
  sessionStore.loadAll();
});

const filteredRoutines = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return routineStore.routines.filter(r => !query || r.routineName.toLowerCase().includes(query));
});

function hasActiveSession(routine) {
  return sessionStore.activeSessionByRoutine.has(routine.id);
}

function openModal() { newName.value = ''; showModal.value = true; }

async function createRoutine() {
  const name = newName.value.trim();
  if (!name) return;
  await routineStore.createRoutine(name);
  showModal.value = false;
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">{{ t('routines.title') }}</h1>
        <p class="page__subtitle">{{ t('routines.subtitle') }}</p>
      </div>
      <button class="btn btn--primary" @click="openModal">
        <span class="material-icons" style="font-size:16px">add</span>
        {{ t('routines.newRoutine') }}
      </button>
    </div>

    <div class="search-bar">
      <span class="material-icons" style="font-size:18px">search</span>
      <input v-model="searchQuery" type="text" :placeholder="t('routines.search')" />
    </div>

    <div v-if="routineStore.error" class="error-msg">{{ routineStore.error }}</div>

    <div v-if="routineStore.loading" class="empty-state card">
      <span class="material-icons empty-icon spin">autorenew</span>
      <p>{{ t('routines.loading') }}</p>
    </div>

    <div v-else-if="!filteredRoutines.length" class="empty-state card">
      <span class="material-icons empty-icon">assignment</span>
      <p>{{ t('routines.empty') }}</p>
    </div>

    <div v-else class="routines-list">
      <router-link v-for="routine in filteredRoutines" :key="routine.id"
        :to="`/routines/${routine.id}`" class="card routine-card">
        <div class="routine-info">
          <h3 class="routine-name">{{ routine.routineName }}</h3>
          <p class="routine-count">{{ routine.exerciseBlockCount }} {{ t('routines.card.exercises') }}</p>
        </div>
        <span v-if="hasActiveSession(routine)" class="badge badge--blue">{{ t('routines.session.activeLabel') }}</span>
      </router-link>
    </div>

    <!-- New Routine Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal card">
        <div class="modal-header">
          <h2 class="modal-title">{{ t('routines.modal.title') }}</h2>
          <button class="close-btn" @click="showModal = false"><span class="material-icons">close</span></button>
        </div>
        <p class="modal-subtitle">{{ t('routines.modal.subtitle') }}</p>

        <div class="form-field">
          <label>{{ t('routines.modal.name') }}</label>
          <input type="text" v-model="newName" :placeholder="t('routines.modal.namePlaceholder')" />
        </div>

        <div v-if="routineStore.error" class="error-msg">{{ routineStore.error }}</div>

        <div class="modal-footer">
          <button class="btn btn--outline" @click="showModal = false">{{ t('routines.modal.cancel') }}</button>
          <button class="btn btn--primary" :disabled="!newName.trim() || routineStore.loading" @click="createRoutine">
            {{ t('routines.modal.create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page__subtitle { color: var(--text-secondary); font-size: .85rem; margin-top: .25rem; }
.search-bar { align-items: center; background: var(--bg-card); border-radius: 8px; display: flex; gap: .5rem; margin-bottom: 1rem; padding: .5rem .75rem; }
.search-bar input { background: none; border: none; color: var(--text-primary); flex: 1; font-size: .85rem; }
.routines-list { display: flex; flex-direction: column; gap: .75rem; }
.routine-card { align-items: center; color: inherit; display: flex; gap: .75rem; justify-content: space-between; padding: 1rem 1.25rem; text-decoration: none; }
.routine-name { font-size: .95rem; font-weight: 600; }
.routine-count { color: var(--text-secondary); font-size: .78rem; margin-top: .2rem; }
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .5rem; padding: 2.5rem; text-align: center; }
.empty-icon { color: var(--text-secondary); font-size: 40px; }
.empty-icon.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.modal-overlay { align-items: center; background: rgba(0,0,0,.5); bottom: 0; display: flex; justify-content: center; left: 0; position: fixed; right: 0; top: 0; z-index: 500; }
.modal { max-width: 420px; padding: 1.5rem; width: 90%; }
.modal-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: .5rem; }
.modal-title { font-size: 1rem; font-weight: 700; }
.modal-subtitle { color: var(--text-secondary); font-size: .8rem; margin-bottom: 1rem; }
.close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.form-field { display: flex; flex-direction: column; gap: .4rem; margin-bottom: 1rem; }
.form-field label { color: var(--text-secondary); font-size: .83rem; font-weight: 500; }
.error-msg { background: rgba(239,68,68,.1); border: 1px solid var(--red); border-radius: 6px; color: var(--red); font-size: .8rem; margin-bottom: .75rem; padding: .5rem .75rem; }
.modal-footer { display: flex; gap: .75rem; justify-content: flex-end; }
</style>
