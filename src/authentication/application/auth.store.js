import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserRole } from '../domain/model/user.entity.js';

const STORAGE_KEY = 'spottrack_user';

const MOCK_USERS = [
  { email: 'admin@spottrack.com',  name: 'Admin',   role: UserRole.ADMIN  },
  { email: 'cliente@email.com',    name: 'Cliente', role: UserRole.CLIENT },
];

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(loadFromStorage());
  const error = ref(null);

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin         = computed(() => user.value?.role === UserRole.ADMIN);
  const isClient        = computed(() => user.value?.role === UserRole.CLIENT);

  function login(email, password) {
    if (!email.trim() || !password.trim()) {
      error.value = 'auth.error.emptyFields';
      return;
    }
    const found = MOCK_USERS.find(u => u.email === email.trim().toLowerCase());
    if (!found) {
      error.value = 'auth.error.invalidCredentials';
      return;
    }
    user.value  = found;
    error.value = null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  }

  function logout() {
    user.value  = null;
    error.value = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  function clearError() { error.value = null; }

  return { user, error, isAuthenticated, isAdmin, isClient, login, logout, clearError };
});

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
