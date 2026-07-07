<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useRoutineStore } from '@/routines/application/routine.store.js';
import { useRoutineSessionStore } from '@/routines/application/routine-session.store.js';
import { ExerciseType } from '@/routines/domain/model/routine.entity.js';
import { RoutineSessionStatus } from '@/routines/domain/model/routine-session.entity.js';

const { t } = useI18n();
const route = useRoute();
const routineStore = useRoutineStore();
const sessionStore  = useRoutineSessionStore();

const routineId = computed(() => Number(route.params.id));
const routine    = computed(() => routineStore.routines.find(r => r.id === routineId.value) ?? null);
const blocks     = computed(() => routineStore.blocksFor(routineId.value));
const activeSession = computed(() => sessionStore.activeSessionByRoutine.get(routineId.value));

const routineSessions = computed(() =>
  sessionStore.sessions
    .filter(s => s.routineId === routineId.value)
    .slice()
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt)));

const showAddBlock  = ref(false);
const newName       = ref('');
const newType        = ref(ExerciseType.Strength);
const newSets        = ref(3);
const newReps        = ref(10);
const blockError     = ref(null);

onMounted(async () => {
  if (!routineStore.routines.length) await routineStore.loadAll();
  if (!sessionStore.sessions.length) await sessionStore.loadAll();
  await routineStore.loadExerciseBlocks(routineId.value);
});

function openAddBlock() {
  newName.value = ''; newType.value = ExerciseType.Strength;
  newSets.value = 3; newReps.value = 10;
  blockError.value = null;
  showAddBlock.value = true;
}

async function submitAddBlock() {
  const name = newName.value.trim();
  if (!name || newSets.value <= 0 || newReps.value <= 0) return;
  try {
    await routineStore.addExerciseBlock(routineId.value, name, newType.value, Number(newSets.value), Number(newReps.value));
    showAddBlock.value = false;
  } catch {
    blockError.value = routineStore.error;
  }
}

function startSession()   { sessionStore.start(routineId.value); }
function completeSession() { if (activeSession.value) sessionStore.complete(activeSession.value.id); }
function markMissed()      { if (activeSession.value) sessionStore.markMissed(activeSession.value.id); }

function isBlockCompleted(exerciseBlockId) {
  return activeSession.value?.isBlockCompleted(exerciseBlockId) ?? false;
}

function toggleBlockCompletion(exerciseBlockId) {
  const session = activeSession.value;
  if (!session) return;
  sessionStore.setExerciseCompletion(session.id, exerciseBlockId, !session.isBlockCompleted(exerciseBlockId));
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
    <router-link to="/routines" class="back-link">
      <span class="material-icons" style="font-size:18px">arrow_back</span>
      {{ t('routines.backToList') }}
    </router-link>

    <template v-if="routine">
      <div class="routine-header">
        <h1 class="page__title">{{ routine.routineName }}</h1>
        <div class="blocks-count">
          <span class="material-icons" style="font-size:16px">fitness_center</span>
          {{ routine.exerciseBlockCount }} {{ t('routines.card.exercises') }}
        </div>
      </div>

      <div class="session-section">
        <template v-if="activeSession">
          <span class="badge badge--blue">{{ t('routines.session.activeLabel') }}</span>
          <button class="btn btn--primary btn--sm" :disabled="sessionStore.actionLoading" @click="completeSession">
            {{ t('routines.session.complete') }}
          </button>
          <button class="btn btn--outline btn--sm btn--danger" :disabled="sessionStore.actionLoading" @click="markMissed">
            {{ t('routines.session.missed') }}
          </button>
        </template>
        <button v-else class="btn btn--primary btn--sm" :disabled="sessionStore.actionLoading" @click="startSession">
          <span class="material-icons" style="font-size:16px">play_arrow</span>
          {{ t('routines.session.start') }}
        </button>
      </div>

      <div v-if="sessionStore.actionError" class="error-msg">{{ sessionStore.actionError }}</div>

      <div class="blocks-section">
        <div class="section-row">
          <h2 class="section-title">{{ t('routines.detail.blocksTitle') }}</h2>
          <button class="btn btn--outline btn--sm" @click="openAddBlock">
            <span class="material-icons" style="font-size:14px">add</span>
            {{ t('routines.detail.addBlock.title') }}
          </button>
        </div>

        <p v-if="!blocks.length" class="empty-msg">{{ t('routines.detail.noBlocks') }}</p>

        <div v-else class="blocks-list">
          <div v-for="block in blocks" :key="block.id" class="card block-card" :class="{ 'block-card--completed': isBlockCompleted(block.id) }">
            <span class="block-order">{{ block.order }}</span>
            <input v-if="activeSession" type="checkbox" class="block-checkbox"
              :checked="isBlockCompleted(block.id)" @change="toggleBlockCompletion(block.id)" />
            <span class="block-name">{{ block.exerciseName }}</span>
            <span class="badge badge--gray">{{ t(`routines.exerciseType.${block.exerciseType}`) }}</span>
            <span class="badge badge--gray">{{ block.sets }} {{ t('routines.detail.addBlock.setsAbbrev') }} × {{ block.reps }} {{ t('routines.detail.addBlock.repsAbbrev') }}</span>
          </div>
        </div>
      </div>

      <div class="history-section">
        <h2 class="section-title">{{ t('routines.session.history.title') }}</h2>
        <p v-if="!routineSessions.length" class="empty-msg">{{ t('routines.session.history.empty') }}</p>
        <div v-else class="history-list">
          <div v-for="session in routineSessions" :key="session.id" class="history-item">
            <span class="history-date">{{ session.startedAt?.slice(0, 16).replace('T', ' ') ?? '—' }}</span>
            <span class="badge" :class="statusClass(session.status)">{{ t(`routines.session.status.${session.status}`) }}</span>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="empty-state card">
      <span class="material-icons empty-icon">search_off</span>
      <p>{{ t('routines.detail.notFound') }}</p>
    </div>

    <!-- Add Exercise Block Modal -->
    <div v-if="showAddBlock" class="modal-overlay" @click.self="showAddBlock = false">
      <div class="modal card">
        <div class="modal-header">
          <h2 class="modal-title">{{ t('routines.detail.addBlock.title') }}</h2>
          <button class="close-btn" @click="showAddBlock = false"><span class="material-icons">close</span></button>
        </div>

        <div class="form-field">
          <label>{{ t('routines.detail.addBlock.name') }}</label>
          <input type="text" v-model="newName" />
        </div>

        <div class="form-field">
          <label>{{ t('routines.detail.addBlock.type') }}</label>
          <select v-model="newType">
            <option :value="ExerciseType.Cardio">{{ t('routines.exerciseType.Cardio') }}</option>
            <option :value="ExerciseType.Strength">{{ t('routines.exerciseType.Strength') }}</option>
            <option :value="ExerciseType.Flexibility">{{ t('routines.exerciseType.Flexibility') }}</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>{{ t('routines.detail.addBlock.sets') }}</label>
            <input type="number" min="1" v-model.number="newSets" />
          </div>
          <div class="form-field">
            <label>{{ t('routines.detail.addBlock.reps') }}</label>
            <input type="number" min="1" v-model.number="newReps" />
          </div>
        </div>

        <div v-if="blockError" class="error-msg">{{ blockError }}</div>

        <div class="modal-footer">
          <button class="btn btn--outline" @click="showAddBlock = false">{{ t('routines.modal.cancel') }}</button>
          <button class="btn btn--primary" :disabled="!newName.trim() || newSets <= 0 || newReps <= 0" @click="submitAddBlock">
            {{ t('routines.detail.addBlock.submit') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.back-link { align-items: center; color: var(--text-secondary); display: inline-flex; font-size: .82rem; gap: .3rem; margin-bottom: 1rem; text-decoration: none; }
.routine-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: 1rem; }
.blocks-count { align-items: center; color: var(--text-secondary); display: flex; font-size: .82rem; gap: .3rem; }
.session-section { align-items: center; display: flex; gap: .6rem; margin-bottom: 1rem; }
.section-row { align-items: center; display: flex; justify-content: space-between; margin-bottom: .6rem; }
.section-title { font-size: .95rem; font-weight: 700; }
.blocks-section { margin-bottom: 1.5rem; }
.blocks-list { display: flex; flex-direction: column; gap: .5rem; }
.block-card { align-items: center; display: flex; gap: .6rem; padding: .6rem .9rem; }
.block-card--completed { opacity: .6; }
.block-order { color: var(--text-secondary); font-family: monospace; font-size: .75rem; }
.block-name { flex: 1; font-size: .85rem; }
.empty-msg { color: var(--text-secondary); font-size: .82rem; }
.history-list { display: flex; flex-direction: column; gap: .4rem; }
.history-item { align-items: center; display: flex; gap: .75rem; }
.history-date { color: var(--text-secondary); font-size: .78rem; min-width: 140px; }
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .5rem; padding: 2.5rem; text-align: center; }
.empty-icon { color: var(--text-secondary); font-size: 40px; }
.btn--sm { font-size: .75rem; padding: .25rem .6rem; }
.btn--danger { border-color: var(--red); color: var(--red); }
.error-msg { background: rgba(239,68,68,.1); border: 1px solid var(--red); border-radius: 6px; color: var(--red); font-size: .8rem; margin-bottom: .75rem; padding: .5rem .75rem; }
.modal-overlay { align-items: center; background: rgba(0,0,0,.5); bottom: 0; display: flex; justify-content: center; left: 0; position: fixed; right: 0; top: 0; z-index: 500; }
.modal { max-width: 420px; padding: 1.5rem; width: 90%; }
.modal-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: 1rem; }
.modal-title { font-size: 1rem; font-weight: 700; }
.close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.form-field { display: flex; flex-direction: column; gap: .4rem; margin-bottom: 1rem; }
.form-field label { color: var(--text-secondary); font-size: .83rem; font-weight: 500; }
.form-row { display: flex; gap: .75rem; }
.form-row .form-field { flex: 1; }
.modal-footer { display: flex; gap: .75rem; justify-content: flex-end; }
</style>
