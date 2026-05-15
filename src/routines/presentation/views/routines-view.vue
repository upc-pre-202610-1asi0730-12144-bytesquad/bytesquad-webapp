<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const activeFilter = ref('all');
const showModal    = ref(false);
const showAltFor   = ref(null);

const newRoutine = ref({ name: '', objective: '', difficulty: 'intermediate', notes: '' });

const FILTERS = ['all', 'chest', 'legs', 'back', 'shoulders', 'arms'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const OBJECTIVES = ['gainStrength', 'muscleHypertrophy', 'endurance', 'weightLoss', 'generalFitness'];

const ROUTINES = [
  {
    id: 1, nameKey: 'routineA', tag: 'chest', difficulty: 'intermediate',
    exercises: [
      { key: 'pressDePecho',      machineKey: 'bancoPechoPlano',       status: 'available',    altKey: null },
      { key: 'sentadillaConBarra', machineKey: 'rackSentadilla2',      status: 'inUse',        altKeys: ['prensaDePiernas', 'hackSquat', 'sentadillaGoblet'] },
    ]
  },
  {
    id: 2, nameKey: 'routineB', tag: 'back', difficulty: 'advanced',
    exercises: [
      { key: 'pesoMuertoRumano',  machineKey: 'plataformaPesoMuerto',  status: 'available',    altKey: null },
      { key: 'dominadas',         machineKey: 'barraDeDominadas',      status: 'maintenance',  altKeys: ['poleaAlta', 'remoConBarra', 'maquinaDeRemo'] },
    ]
  },
  {
    id: 3, nameKey: 'routineC', tag: 'shoulders', difficulty: 'beginner',
    exercises: [
      { key: 'pressMilitar',      machineKey: 'rackDeFuerza',          status: 'available',    altKey: null },
    ]
  },
];

const filtered = computed(() =>
  activeFilter.value === 'all' ? ROUTINES : ROUTINES.filter(r => r.tag === activeFilter.value)
);

const STATUS_CLASS = { available: 'status--green', inUse: 'status--amber', maintenance: 'status--red' };

function openModal()  { newRoutine.value = { name: '', objective: '', difficulty: 'intermediate', notes: '' }; showModal.value = true; }
function createRoutine() {
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
      <button class="btn btn--accent" @click="openModal">
        <span class="material-icons" style="font-size:16px">add</span>
        {{ t('routines.newRoutine') }}
      </button>
    </div>

    <!-- Filter chips -->
    <div class="filter-chips">
      <button v-for="f in FILTERS" :key="f"
        class="chip" :class="{ 'chip--active': activeFilter === f }"
        @click="activeFilter = f">
        {{ t(`routines.filter.${f}`) }}
      </button>
    </div>

    <div class="routines-layout">
      <div class="routines-col">
        <!-- Routine cards -->
        <div v-for="routine in filtered" :key="routine.id" class="card routine-card">
          <div class="routine-header">
            <div>
              <h3 class="routine-name">{{ t(`routines.exercises.${routine.exercises[0].key}`) || routine.nameKey }}</h3>
              <div class="routine-meta">
                <span class="tag">{{ t(`routines.tags.${routine.tag}`) }}</span>
                <span class="level-badge">{{ t(`routines.level.${routine.difficulty}`) }}</span>
              </div>
            </div>
          </div>

          <div class="exercise-list">
            <div v-for="(ex, idx) in routine.exercises" :key="idx" class="exercise-row">
              <div class="exercise-info">
                <span class="ex-name">{{ t(`routines.exercises.${ex.key}`) || ex.key }}</span>
                <span class="ex-machine">{{ t(`routines.machines.${ex.machineKey}`) || ex.machineKey }}</span>
              </div>
              <span class="status-chip" :class="STATUS_CLASS[ex.status]">
                {{ t(`routines.status.${ex.status}`) }}
              </span>

              <button v-if="ex.status !== 'available'" class="btn btn--outline btn--xs"
                @click="showAltFor = showAltFor === `${routine.id}-${idx}` ? null : `${routine.id}-${idx}`">
                <span class="material-icons" style="font-size:13px">swap_horiz</span>
              </button>
            </div>

            <!-- Alternatives panel -->
            <template v-for="(ex, idx) in routine.exercises" :key="`alt-${idx}`">
              <div v-if="showAltFor === `${routine.id}-${idx}` && ex.altKeys" class="alt-panel">
                <p class="alt-panel-title">{{ t('routines.alternatives.title') }}</p>
                <div class="alt-list">
                  <div v-for="altKey in ex.altKeys" :key="altKey" class="alt-item">
                    <span class="material-icons" style="font-size:16px;color:var(--green)">fitness_center</span>
                    <span class="alt-name">{{ t(`routines.alternatives.${altKey}`) || altKey }}</span>
                    <span class="alt-free">{{ t('routines.alternatives.free') }}</span>
                    <button class="btn btn--outline btn--xs" @click="router.push('/map')">
                      {{ t('routines.alternatives.viewMap') }}
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div v-if="!filtered.length" class="empty-state card">
          <span class="material-icons" style="font-size:40px;color:var(--text-secondary)">assignment</span>
          <p>{{ t('routines.search') }}</p>
        </div>
      </div>

      <!-- Smart suggestion sidebar -->
      <div class="card suggestion-card">
        <h3 class="sug-title">
          <span class="material-icons" style="color:var(--accent);font-size:18px">auto_awesome</span>
          {{ t('routines.suggestion.title') }}
        </h3>
        <ul class="sug-list">
          <li>{{ t('routines.suggestion.item1') }}</li>
          <li>{{ t('routines.suggestion.item2') }}</li>
          <li>{{ t('routines.suggestion.item3') }}</li>
          <li>{{ t('routines.suggestion.item4') }}</li>
        </ul>
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
        <p class="modal-sub">{{ t('routines.modal.subtitle') }}</p>

        <div class="form-field">
          <label>{{ t('routines.modal.name') }}</label>
          <input type="text" v-model="newRoutine.name" :placeholder="t('routines.modal.namePlaceholder')" />
        </div>

        <div class="form-field">
          <label>{{ t('routines.modal.objective') }}</label>
          <select v-model="newRoutine.objective">
            <option value="" disabled>{{ t('routines.modal.selectObjective') }}</option>
            <option v-for="obj in OBJECTIVES" :key="obj" :value="obj">
              {{ t(`routines.modal.objectives.${obj}`) }}
            </option>
          </select>
        </div>

        <div class="form-field">
          <label>{{ t('routines.modal.difficulty') }}</label>
          <div class="diff-options">
            <button v-for="d in DIFFICULTIES" :key="d"
              class="btn diff-btn" :class="newRoutine.difficulty === d ? 'btn--accent' : 'btn--outline'"
              @click="newRoutine.difficulty = d">
              {{ t(`routines.level.${d}`) }}
            </button>
          </div>
        </div>

        <div class="form-field">
          <label>{{ t('routines.modal.notes') }}</label>
          <textarea v-model="newRoutine.notes" :placeholder="t('routines.modal.notesPlaceholder')" rows="3"></textarea>
        </div>

        <div class="modal-footer">
          <button class="btn btn--outline" @click="showModal = false">{{ t('routines.modal.cancel') }}</button>
          <button class="btn btn--accent" :disabled="!newRoutine.name || !newRoutine.objective" @click="createRoutine">
            {{ t('routines.modal.create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page__subtitle { color: var(--text-secondary); font-size: .85rem; margin-top: .25rem; }
.page__header { align-items: flex-start; display: flex; flex-wrap: wrap; gap: .75rem; justify-content: space-between; margin-bottom: 1rem; }
.btn--accent { background: var(--accent); border: none; color: #000; font-weight: 600; }
.btn--accent:disabled { opacity: .5; cursor: default; }
.filter-chips { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 1rem; }
.chip { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 20px; color: var(--text-secondary); cursor: pointer; font-size: .8rem; padding: .3rem .85rem; transition: all .15s; }
.chip--active { background: var(--accent); border-color: var(--accent); color: #000; font-weight: 600; }
.routines-layout { display: grid; gap: 1rem; grid-template-columns: 1fr; }
.routines-col { display: flex; flex-direction: column; gap: .75rem; }
.routine-card { }
.routine-header { margin-bottom: .75rem; }
.routine-name { font-size: .92rem; font-weight: 600; margin-bottom: .35rem; }
.routine-meta { display: flex; gap: .5rem; }
.tag { background: rgba(245,188,54,.15); border-radius: 12px; color: var(--accent); font-size: .72rem; font-weight: 600; padding: .15rem .5rem; }
.level-badge { background: rgba(255,255,255,.06); border-radius: 12px; color: var(--text-secondary); font-size: .72rem; padding: .15rem .5rem; }
.exercise-list { display: flex; flex-direction: column; gap: .5rem; }
.exercise-row { align-items: center; background: var(--bg-surface); border-radius: 6px; display: flex; gap: .75rem; padding: .5rem .75rem; }
.exercise-info { display: flex; flex: 1; flex-direction: column; gap: .1rem; }
.ex-name { font-size: .83rem; font-weight: 500; }
.ex-machine { color: var(--text-secondary); font-size: .75rem; }
.status-chip { border-radius: 10px; font-size: .72rem; font-weight: 600; padding: .15rem .5rem; }
.status--green { background: rgba(34,197,94,.15); color: var(--green); }
.status--amber { background: rgba(245,188,54,.15); color: var(--accent); }
.status--red   { background: rgba(239,68,68,.15);  color: var(--red); }
.btn--xs { padding: .2rem .45rem; font-size: .73rem; }
.alt-panel { background: rgba(255,255,255,.03); border-left: 3px solid var(--accent); border-radius: 0 6px 6px 0; margin-top: -.25rem; padding: .6rem .75rem; }
.alt-panel-title { color: var(--accent); font-size: .78rem; font-weight: 600; margin-bottom: .5rem; }
.alt-list { display: flex; flex-direction: column; gap: .4rem; }
.alt-item { align-items: center; display: flex; gap: .5rem; }
.alt-name { flex: 1; font-size: .8rem; }
.alt-free { color: var(--green); font-size: .72rem; font-weight: 600; }
.suggestion-card { height: fit-content; }
.sug-title { align-items: center; display: flex; font-size: .88rem; font-weight: 600; gap: .4rem; margin-bottom: .75rem; }
.sug-list { color: var(--text-secondary); display: flex; flex-direction: column; font-size: .8rem; gap: .5rem; padding-left: 1.25rem; }
.sug-list li::marker { color: var(--accent); }
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .5rem; padding: 2rem; text-align: center; color: var(--text-secondary); }
.modal-overlay { align-items: center; background: rgba(0,0,0,.5); bottom: 0; display: flex; justify-content: center; left: 0; position: fixed; right: 0; top: 0; z-index: 500; }
.modal { max-width: 460px; padding: 1.5rem; width: 90%; }
.modal-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: .4rem; }
.modal-title { font-size: 1rem; font-weight: 700; }
.modal-sub { color: var(--text-secondary); font-size: .82rem; margin-bottom: 1.25rem; }
.close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.form-field { display: flex; flex-direction: column; gap: .4rem; margin-bottom: 1rem; }
.form-field label { color: var(--text-secondary); font-size: .83rem; font-weight: 500; }
textarea { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); font-family: inherit; font-size: .85rem; padding: .5rem .75rem; resize: vertical; width: 100%; }
.diff-options { display: flex; gap: .5rem; }
.diff-btn { font-size: .8rem; padding: .3rem .75rem; }
.modal-footer { display: flex; gap: .75rem; justify-content: flex-end; }
@media (min-width: 900px) { .routines-layout { grid-template-columns: 1fr 280px; } }
</style>
