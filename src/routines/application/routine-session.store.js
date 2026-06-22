import { defineStore } from 'pinia';
import { ref } from 'vue';
import { RoutineSessionApi } from '../infrastructure/routine-session-api.js';
import { RoutineSessionStatus } from '../domain/model/routine-session.entity.js';
import { useAuthStore } from '@/authentication/application/auth.store.js';

const api = new RoutineSessionApi();

export const useRoutineSessionStore = defineStore('routineSession', () => {
  const sessions = ref([]);
  const loading  = ref(false);
  const error    = ref(null);

  function _upsert(session) {
    const idx = sessions.value.findIndex(s => s.id === session.id);
    if (idx >= 0) sessions.value = sessions.value.map(s => s.id === session.id ? session : s);
    else sessions.value = [session, ...sessions.value];
  }

  function _upsertStatus(id, status) {
    sessions.value = sessions.value.map(s => s.id === id ? { ...s, status } : s);
  }

  async function loadByClient(clientId) {
    if (!clientId) return;
    loading.value = true; error.value = null;
    try {
      sessions.value = await api.getByClient(clientId);
    } catch (e) {
      error.value = e.message || 'Failed to load sessions';
    } finally { loading.value = false; }
  }

  async function createSession(routineId) {
    const auth = useAuthStore();
    if (!auth.user?.id) return;
    loading.value = true; error.value = null;
    try {
      const created = await api.create(routineId, auth.user.id);
      _upsert(created);
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create session';
    } finally { loading.value = false; }
  }

  async function complete(sessionId) {
    try {
      await api.complete(sessionId);
      _upsertStatus(sessionId, RoutineSessionStatus.Completed);
    } catch (e) { error.value = e.message; }
  }

  async function miss(sessionId) {
    try {
      await api.miss(sessionId);
      _upsertStatus(sessionId, RoutineSessionStatus.Missed);
    } catch (e) { error.value = e.message; }
  }

  // TODO: no DELETE for sessions in backend contract

  return { sessions, loading, error, loadByClient, createSession, complete, miss };
});
