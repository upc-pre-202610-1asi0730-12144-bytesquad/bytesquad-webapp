import { defineStore } from 'pinia';
import { ref } from 'vue';
import { RoutineApi } from '../infrastructure/routine-api.js';
import { useAuthStore } from '@/authentication/application/auth.store.js';

const api = new RoutineApi();

export const useRoutineStore = defineStore('routine', () => {
  const routines = ref([]);
  const loading  = ref(false);
  const error    = ref(null);

  function _upsert(routine) {
    const idx = routines.value.findIndex(r => r.id === routine.id);
    if (idx >= 0) routines.value = routines.value.map(r => r.id === routine.id ? { ...r, ...routine } : r);
    else routines.value = [routine, ...routines.value];
  }

  async function loadByClient(clientId) {
    if (!clientId) return;
    loading.value = true; error.value = null;
    try {
      routines.value = await api.getByClient(clientId);
    } catch (e) {
      error.value = e.message || 'Failed to load routines';
    } finally { loading.value = false; }
  }

  async function createRoutine(routineName) {
    const auth = useAuthStore();
    if (!auth.user?.id) return;
    loading.value = true; error.value = null;
    try {
      const created = await api.create(routineName, auth.user.id);
      _upsert(created);
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create routine';
    } finally { loading.value = false; }
  }

  // TODO: exercise blocks are write-only from backend; stored locally in routine.exerciseBlocks after POST
  async function addExerciseBlock(routineId, exerciseName, exerciseType) {
    const routine = routines.value.find(r => r.id === routineId);
    if (!routine) return;
    const order = (routine.exerciseBlocks?.length ?? 0) + 1;
    try {
      const block = await api.addExerciseBlock(routineId, exerciseName, exerciseType, order);
      routines.value = routines.value.map(r =>
        r.id === routineId
          ? { ...r, exerciseBlocks: [...(r.exerciseBlocks ?? []), block], exerciseBlockCount: r.exerciseBlockCount + 1 }
          : r
      );
      return block;
    } catch (e) {
      error.value = e.message || 'Failed to add exercise block';
    }
  }

  // TODO: no PUT/DELETE for routines in backend contract

  return { routines, loading, error, loadByClient, createRoutine, addExerciseBlock };
});
