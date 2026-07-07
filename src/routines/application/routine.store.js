import { defineStore } from 'pinia';
import { ref } from 'vue';
import { RoutineApi } from '../infrastructure/routine-api.js';

const api = new RoutineApi();

export const useRoutineStore = defineStore('routine', () => {
  const routines = ref([]);
  const exerciseBlocksByRoutine = ref({});
  const loading  = ref(false);
  const error    = ref(null);

  function _upsert(routine) {
    const idx = routines.value.findIndex(r => r.id === routine.id);
    if (idx >= 0) routines.value = routines.value.map(r => r.id === routine.id ? { ...r, ...routine } : r);
    else routines.value = [routine, ...routines.value];
  }

  async function loadAll() {
    loading.value = true; error.value = null;
    try {
      routines.value = await api.getAll();
    } catch (e) {
      error.value = e.message || 'Failed to load routines';
    } finally { loading.value = false; }
  }

  async function createRoutine(routineName) {
    loading.value = true; error.value = null;
    try {
      const created = await api.create(routineName);
      _upsert(created);
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create routine';
    } finally { loading.value = false; }
  }

  function blocksFor(routineId) {
    return exerciseBlocksByRoutine.value[routineId] ?? [];
  }

  async function loadExerciseBlocks(routineId) {
    try {
      const blocks = await api.getExerciseBlocks(routineId);
      exerciseBlocksByRoutine.value = { ...exerciseBlocksByRoutine.value, [routineId]: blocks };
    } catch (e) {
      error.value = e.message || 'Failed to load exercise blocks';
    }
  }

  async function addExerciseBlock(routineId, exerciseName, exerciseType, sets, reps) {
    const order = blocksFor(routineId).length + 1;
    try {
      await api.addExerciseBlock(routineId, exerciseName, exerciseType, order, sets, reps);
      await loadExerciseBlocks(routineId);
      const routine = routines.value.find(r => r.id === routineId);
      if (routine) _upsert({ ...routine, exerciseBlockCount: routine.exerciseBlockCount + 1 });
    } catch (e) {
      error.value = e.message || 'Failed to add exercise block';
      throw e;
    }
  }

  return {
    routines, loading, error,
    loadAll, createRoutine, blocksFor, loadExerciseBlocks, addExerciseBlock,
  };
});
