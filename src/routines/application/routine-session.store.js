import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { RoutineSessionApi } from '../infrastructure/routine-session-api.js';
import { RoutineSessionStatus } from '../domain/model/routine-session.entity.js';

const api = new RoutineSessionApi();

export const useRoutineSessionStore = defineStore('routineSession', () => {
  const sessions      = ref([]);
  const loading       = ref(false);
  const error         = ref(null);
  const actionLoading = ref(false);
  const actionError   = ref(null);

  const activeSessionByRoutine = computed(() => {
    const map = new Map();
    for (const session of sessions.value) {
      if (session.status === RoutineSessionStatus.Started) map.set(session.routineId, session);
    }
    return map;
  });

  function _replace(updated) {
    sessions.value = sessions.value.map(s => s.id === updated.id ? updated : s);
  }

  async function loadAll() {
    loading.value = true; error.value = null;
    try {
      sessions.value = await api.getAll();
    } catch (e) {
      error.value = e.message || 'Failed to load sessions';
    } finally { loading.value = false; }
  }

  async function start(routineId) {
    actionLoading.value = true; actionError.value = null;
    try {
      const created = await api.create(routineId);
      sessions.value = [created, ...sessions.value];
      return created;
    } catch (e) {
      actionError.value = e.message || 'Failed to start session';
    } finally { actionLoading.value = false; }
  }

  async function complete(sessionId) {
    actionLoading.value = true; actionError.value = null;
    try {
      _replace(await api.complete(sessionId));
    } catch (e) {
      actionError.value = e.message || 'Failed to complete session';
    } finally { actionLoading.value = false; }
  }

  async function markMissed(sessionId) {
    actionLoading.value = true; actionError.value = null;
    try {
      _replace(await api.miss(sessionId));
    } catch (e) {
      actionError.value = e.message || 'Failed to mark session as missed';
    } finally { actionLoading.value = false; }
  }

  async function setExerciseCompletion(sessionId, exerciseBlockId, completed) {
    actionError.value = null;
    try {
      _replace(await api.setExerciseCompletion(sessionId, exerciseBlockId, completed));
    } catch (e) {
      actionError.value = e.message || 'Failed to update exercise completion';
    }
  }

  return {
    sessions, loading, error, actionLoading, actionError, activeSessionByRoutine,
    loadAll, start, complete, markMissed, setExerciseCompletion,
  };
});
