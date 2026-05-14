<script setup>
import { computed } from 'vue';
import { RouterLink, useLink } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps({ role: String, open: Boolean });
const emit  = defineEmits(['linkClicked']);
const { t } = useI18n();

const ADMIN_NAV = [
  { path: '/dashboard',        icon: 'space_dashboard',   labelKey: 'nav.dashboard' },
  { path: '/equipment',        icon: 'fitness_center',    labelKey: 'nav.equipment' },
  { path: '/iot',              icon: 'sensors',           labelKey: 'nav.iot' },
  { path: '/maintenance',      icon: 'build',             labelKey: 'nav.maintenance' },
  { path: '/analytics',        icon: 'bar_chart',         labelKey: 'nav.analytics' },
  { path: '/financial-impact', icon: 'trending_up',       labelKey: 'nav.financial' },
  { path: '/configuration',    icon: 'settings',          labelKey: 'nav.configuration' },
];

const navItems = computed(() => ADMIN_NAV);
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--open': open }">
    <div class="sidebar__brand">SpotTrack</div>
    <nav class="sidebar__nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        class="sidebar__item"
        :to="item.path"
        active-class="sidebar__item--active"
        @click="emit('linkClicked')"
      >
        <span class="material-icons">{{ item.icon }}</span>
        <span>{{ t(item.labelKey) }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar { background: var(--bg-surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; width: 220px; min-height: 100vh; flex-shrink: 0; }
.sidebar__brand { border-bottom: 1px solid var(--border); font-size: 1.1rem; font-weight: 700; padding: 1.25rem 1.5rem; }
.sidebar__nav { display: flex; flex-direction: column; gap: 2px; padding: 0.75rem 0.5rem; }
.sidebar__item { align-items: center; border-radius: 8px; color: var(--text-secondary); display: flex; gap: 0.75rem; font-size: 0.875rem; padding: 0.625rem 1rem; text-decoration: none; transition: background .15s, color .15s; }
.sidebar__item:hover { background: rgba(255,255,255,.05); color: var(--text-primary); }
.sidebar__item--active { background: var(--accent-dim); color: var(--accent); }
@media (max-width: 767px) {
  .sidebar { position: fixed; top: 0; left: 0; height: 100%; z-index: 200; transform: translateX(-100%); transition: transform .25s; }
  .sidebar--open { transform: translateX(0); }
}
</style>
