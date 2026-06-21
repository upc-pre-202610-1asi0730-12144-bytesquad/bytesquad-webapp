<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoutineStore } from '@/routines/application/routine.store.js';
import { useRoutineSessionStore } from '@/routines/application/routine-session.store.js';
import { useAuthStore } from '@/authentication/application/auth.store.js';
import { ExerciseType } from '@/routines/domain/model/routine.entity.js';
import { RoutineSessionStatus } from '@/routines/domain/model/routine-session.entity.js';

const { t }        = useI18n();
const routineStore = useRoutineStore();
const sessionStore = useRoutineSessionStore();
const auth         = useAuthStore();

const showModal   = ref(false);
const newName     = ref('');
const blockForms  = ref({});

onMounted(() => {
  routineStore.loadByClient(auth.user?.id);
  sessionStore.loadByClient(auth.user?.id);
});

function openModal() { newName.value = ''; showModal.value = true; }

async function submitRoutine() {
  if (!newName.value.trim()) return;
  await routineStore.createRoutine(newName.value.trim());
  showModal.value = false;
}

function blockForm(routineId) {
  if (!blockForms.value[routineId]) {
    blockForms.value[routineId] = { exerciseName: '', exerciseType: ExerciseType.Strength, open: false };
  }
  return blockForms.value[routineId];
}

function toggleBlockForm(routineId) {
  const f = blockForm(routineId);
  f.open = !f.open;
}

async function submitBlock(routineId) {
  const f = blockForm(routineId);
  if (!f.exerciseName.trim()) return;
  await routineStore.addExerciseBlock(routineId, f.exerciseName.trim(), f.exerciseType);
  f.exerciseName = '';
  f.open = false;
}

function sessionsFor(routineId) {
  return sessionStore.sessions.filter(s => s.routineId === routineId);
}

function statusClass(status) {
  return {
    [RoutineSessionStatus.Started]:   'badge--blue',
    [RoutineSessionStatus.Completed]: 'badge--green',
    [RoutineSessionStatus.Missed]:    'badge--red',
  }[status] ?? 'badge--gray';
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('routines.title') }}</h1>
      <button class="btn btn--primary" @click="openModal">
        <span class="material-icons" style="font-size:16px">add</span>
        {{ t('routines.newRoutine') }}
      </button>
    </div>

    <div v-if="routineStore.loading" class="empty-state card">
      <span class="material-icons empty-icon">hourglass_empty</span>
      <p class="empty-title">{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="!routineStore.routines.length" class="empty-state card">
      <span class="material-icons empty-icon">assignment</span>
      <p class="empty-title">{{ t('routines.empty') }}</p>
    </div>

    <div v-else class="routines-list">
      <div v-for="routine in routineStore.routines" :key="routine.id" class="card routine-card">

        <!-- Routine header -->
        <div class="routine-header">
          <span class="routine-name">{{ routine.routineName }}</span>
          <span class="count-badge">{{ routine.exerciseBlockCount }} {{ t('routines.blocks') }}</span>
        </div>

        <!-- Exercise blocks (local state after POST) -->
        <!-- TODO: exercise blocks are write-only; displayed from local state after POST /exercise-blocks -->
        <div v-if="routine.exerciseBlocks?.length" class="blocks-list">
          <div v-for="block in routine.exerciseBlocks" :key="block.id" class="block-row">
            <span class="block-order">#{{ block.order }}</span>
            <span class="block-name">{{ block.exerciseName }}</span>
            <span class="block-type badge badge--gray">{{ block.exerciseType }}</span>
          </div>
        </div>

        <!-- Add exercise block form -->
        <div class="block-add">
          <button class="btn btn--outline btn--sm" @click="toggleBlockForm(routine.id)">
            <span class="material-icons" style="font-size:14px">add</span>
            {{ t('routines.addBlock') }}
          </button>
          <div v-if="blockForm(routine.id).open" class="block-form">
            <input
              v-model="blockForm(routine.id).exerciseName"
              :placeholder="t('routines.blockName')"
              class="block-input"
            />
            <select v-model="blockForm(routine.id).exerciseType" class="block-select">
              <option :value="ExerciseType.Cardio">{{ ExerciseType.Cardio }}</option>
              <option :value="ExerciseType.Strength">{{ ExerciseType.Strength }}</option>
              <option :value="ExerciseType.Flexibility">{{ ExerciseType.Flexibility }}</option>
            </select>
            <button class="btn btn--primary btn--sm" @click="submitBlock(routine.id)">
              {{ t('routines.save') }}
            </button>
          </div>
        </div>

        <!-- Sessions for this routine -->
        <div class="sessions-section">
          <div class="sessions-header">
            <span class="sessions-label">{{ t('routines.sessions') }}</span>
            <button class="btn btn--outline btn--sm" @click="sessionStore.createSession(routine.id)">
              <span class="material-icons" style="font-size:14px">play_arrow</span>
              {{ t('routines.startSession') }}
            </button>
          </div>

          <div v-if="!sessionsFor(routine.id).length" class="sessions-empty">
            {{ t('routines.noSessions') }}
          </div>

          <div v-for="session in sessionsFor(routine.id)" :key="session.id" class="session-row">
            <span class="session-date">{{ session.startedAt?.slice(0, 10) ?? '—' }}</span>
            <span class="badge" :class="statusClass(session.status)">{{ session.status }}</span>
            <div v-if="session.status === RoutineSessionStatus.Started" class="session-actions">
              <button class="btn btn--primary btn--sm" @click="sessionStore.complete(session.id)">
                {{ t('routines.complete') }}
              </button>
              <button class="btn btn--outline btn--sm btn--danger" @click="sessionStore.miss(session.id)">
                {{ t('routines.miss') }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- New Routine Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal card">
        <div class="modal-header">
          <h2 class="modal-title">{{ t('routines.modal.title') }}</h2>
          <button class="close-btn" @click="showModal = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="form-field">
          <label>{{ t('routines.modal.name') }}</label>
          <input type="text" v-model="newName" :placeholder="t('routines.modal.namePlaceholder')" />
        </div>
        <div v-if="routineStore.error" class="error-msg">{{ routineStore.error }}</div>
        <div class="modal-footer">
          <button class="btn btn--outline" @click="showModal = false">{{ t('routines.modal.cancel') }}</button>
          <button class="btn btn--primary" :disabled="!newName.trim() || routineStore.loading" @click="submitRoutine">
            {{ t('routines.modal.create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.routines-list { display: flex; flex-direction: column; gap: .75rem; }
.routine-card { display: flex; flex-direction: column; gap: .75rem; }
.routine-header { align-items: center; display: flex; gap: .75rem; }
.routine-name { font-size: .95rem; font-weight: 600; flex: 1; }
.count-badge { background: rgba(245,188,54,.15); border-radius: 12px; color: var(--accent); font-size: .72rem; font-weight: 600; padding: .15rem .55rem; }
.blocks-list { display: flex; flex-direction: column; gap: .35rem; }
.block-row { align-items: center; background: var(--bg-surface); border-radius: 6px; display: flex; gap: .6rem; padding: .4rem .75rem; }
.block-order { color: var(--text-secondary); font-family: monospace; font-size: .75rem; min-width: 1.5rem; }
.block-name { flex: 1; font-size: .83rem; }
.block-type { font-size: .72rem; }
.block-add { display: flex; flex-direction: column; gap: .5rem; }
.block-form { align-items: center; display: flex; flex-wrap: wrap; gap: .5rem; }
.block-input { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); flex: 1; font-size: .83rem; min-width: 140px; padding: .375rem .6rem; }
.block-select { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); font-size: .83rem; padding: .375rem .6rem; }
.sessions-section { border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: .4rem; padding-top: .625rem; }
.sessions-header { align-items: center; display: flex; justify-content: space-between; }
.sessions-label { color: var(--text-secondary); font-size: .8rem; font-weight: 500; }
.sessions-empty { color: var(--text-secondary); font-size: .78rem; }
.session-row { align-items: center; display: flex; flex-wrap: wrap; gap: .5rem; }
.session-date { color: var(--text-secondary); font-size: .78rem; min-width: 80px; }
.session-actions { display: flex; gap: .4rem; margin-left: auto; }
.btn--sm { font-size: .75rem; padding: .25rem .6rem; }
.btn--danger { border-color: var(--red); color: var(--red); }
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .5rem; padding: 2.5rem; text-align: center; }
.empty-icon { color: var(--text-secondary); font-size: 48px; }
.empty-title { color: var(--text-secondary); font-size: .9rem; }
.modal-overlay { align-items: center; background: rgba(0,0,0,.5); bottom: 0; display: flex; justify-content: center; left: 0; position: fixed; right: 0; top: 0; z-index: 500; }
.modal { max-width: 420px; padding: 1.5rem; width: 90%; }
.modal-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: 1rem; }
.modal-title { font-size: 1rem; font-weight: 700; }
.close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.form-field { display: flex; flex-direction: column; gap: .4rem; margin-bottom: 1rem; }
.form-field label { color: var(--text-secondary); font-size: .83rem; font-weight: 500; }
.error-msg { background: rgba(239,68,68,.1); border: 1px solid var(--red); border-radius: 6px; color: var(--red); font-size: .8rem; margin-bottom: .75rem; padding: .5rem .75rem; }
.modal-footer { display: flex; gap: .75rem; justify-content: flex-end; }
</style>
