<script setup>
import { ref, computed } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/authentication/application/auth.store.js';
import { useAlertsStore } from '@/alerts/application/alerts.service.js';
import SidebarComponent from '../sidebar/sidebar.vue';
import BottomBar from '../bottom-bar/bottom-bar.vue';
import UserProfile from '../user-profile/user-profile.vue';
import LanguageSwitcher from '../language-switcher/language-switcher.vue';

const auth        = useAuthStore();
const alertsStore = useAlertsStore();
const router      = useRouter();
const { t }       = useI18n();

const sidebarOpen = ref(false);

const isAdmin  = computed(() => auth.isAdmin);
const isClient = computed(() => auth.isClient);

const unreadCount = computed(() => {
  const role = auth.isAdmin ? 'admin' : 'client';
  return alertsStore.alerts.filter(a => {
    const visible = role === 'admin'
      ? a.type === 'admin' || a.type === 'system'
      : a.type === 'client';
    return visible && !a.read[role];
  }).length;
});

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <div class="shell">
    <SidebarComponent v-if="isAdmin" :open="sidebarOpen" @linkClicked="sidebarOpen = false" />
    <div v-if="isAdmin && sidebarOpen" class="overlay" @click="sidebarOpen = false" />

    <div class="shell__main">
      <header class="topbar">
        <button v-if="isAdmin" class="hamburger" @click="sidebarOpen = !sidebarOpen">
          <span class="material-icons">menu</span>
        </button>
        <span class="topbar__brand" v-if="isClient">SpotTrack</span>
        <div class="topbar__right">
          <button class="topbar__icon-btn" @click="router.push('/alerts')">
            <span class="material-icons">notifications</span>
            <span v-if="unreadCount > 0" class="badge-dot">{{ unreadCount }}</span>
          </button>
          <UserProfile />
          <LanguageSwitcher />
          <button class="topbar__icon-btn" @click="logout" :title="t('nav.logout')">
            <span class="material-icons">logout</span>
          </button>
        </div>
      </header>

      <main class="shell__content" :class="{ 'shell__content--client': isClient }">
        <RouterView />
      </main>
    </div>

    <BottomBar v-if="isClient" />
  </div>
</template>

<style scoped>
.shell { display: flex; min-height: 100vh; }
.shell__main { display: flex; flex: 1; flex-direction: column; min-width: 0; }
.topbar { align-items: center; background: var(--bg-surface); border-bottom: 1px solid var(--border); display: flex; gap: 0.75rem; height: 52px; padding: 0 1rem; position: sticky; top: 0; z-index: 100; }
.topbar__brand { font-weight: 700; }
.topbar__right { align-items: center; display: flex; gap: 0.5rem; margin-left: auto; }
.topbar__icon-btn { align-items: center; background: none; border: none; border-radius: 50%; color: var(--text-secondary); cursor: pointer; display: flex; height: 36px; justify-content: center; position: relative; width: 36px; }
.topbar__icon-btn:hover { background: rgba(255,255,255,.06); color: var(--text-primary); }
.badge-dot { align-items: center; background: var(--red); border-radius: 50%; color: #fff; display: flex; font-size: 0.6rem; font-weight: 700; height: 16px; justify-content: center; position: absolute; right: 2px; top: 2px; width: 16px; }
.hamburger { background: none; border: none; color: var(--text-primary); cursor: pointer; display: none; }
.shell__content { flex: 1; overflow-y: auto; padding: 0; }
.shell__content--client { padding-bottom: 64px; }
.overlay { background: rgba(0,0,0,.5); bottom: 0; left: 0; position: fixed; right: 0; top: 0; z-index: 150; }
@media (max-width: 767px) { .hamburger { display: flex; } }
</style>
