import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthApi } from '../infrastructure/auth-api.js';
import { User, UserRole } from '../domain/model/user.entity.js';

const STORAGE_KEY = 'spottrack_session';
const api = new AuthApi();

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export const useAuthStore = defineStore('auth', () => {
  const _session = loadSession();

  const user    = ref(_session ? new User(_session) : null);
  const token   = ref(_session?.token ?? null);
  const users   = ref([]);
  const loading = ref(false);
  const error   = ref(null);

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin         = computed(() => user.value?.role === UserRole.ADMIN);
  const isClient        = computed(() => user.value?.role === UserRole.CLIENT);

  async function signIn(username, password) {
    if (!username.trim() || !password.trim()) {
      error.value = 'auth.error.emptyFields';
      return;
    }
    loading.value = true; error.value = null;
    try {
      const data  = await api.signIn(username.trim(), password);
      user.value  = new User(data);
      token.value = data.token;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      error.value = 'auth.error.invalidCredentials';
    } finally { loading.value = false; }
  }

  async function signUp(username, password) {
    loading.value = true; error.value = null;
    try {
      await api.signUp(username, password);
    } catch {
      error.value = 'auth.error.signUpFailed';
    } finally { loading.value = false; }
  }

  async function getUsers() {
    loading.value = true; error.value = null;
    try {
      users.value = await api.getUsers();
    } catch {
      error.value = 'auth.error.loadUsersFailed';
    } finally { loading.value = false; }
  }

  function logout() {
    user.value  = null;
    token.value = null;
    error.value = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  function clearError() { error.value = null; }

  return { user, token, users, loading, error, isAuthenticated, isAdmin, isClient, signIn, signUp, getUsers, logout, clearError };
});
