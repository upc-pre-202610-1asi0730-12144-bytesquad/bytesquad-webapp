<script setup>
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const navItems = [
  { path: '/map',      icon: 'map',            labelKey: 'nav.map' },
  { path: '/routines', icon: 'assignment',      labelKey: 'nav.routines' },
  { path: '/bookings', icon: 'calendar_month',  labelKey: 'nav.bookings' },
  { path: '/profile',  icon: 'person',          labelKey: 'nav.profile' },
];
</script>

<template>
  <nav class="bottom-bar">
    <RouterLink
      v-for="item in navItems"
      :key="item.path"
      class="bottom-bar__item"
      :to="item.path"
      active-class="bottom-bar__item--active"
    >
      <span class="material-icons">{{ item.icon }}</span>
      <span>{{ t(item.labelKey) }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-bar { background: var(--bg-surface); border-top: 1px solid var(--border); bottom: 0; display: flex; height: 60px; left: 0; position: fixed; right: 0; z-index: 100; }
.bottom-bar__item { align-items: center; color: var(--text-secondary); display: flex; flex: 1; flex-direction: column; font-size: 0.65rem; gap: 2px; justify-content: center; text-decoration: none; transition: color .15s; }
.bottom-bar__item--active { color: var(--accent); }
.bottom-bar__item .material-icons { font-size: 22px; }
</style>
