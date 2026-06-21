<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAlertsStore } from '@/alerts/application/alerts.service.js';
import { useAuthStore } from '@/authentication/application/auth.store.js';

const { t } = useI18n();
const router  = useRouter();
const store   = useAlertsStore();
const auth    = useAuthStore();

const role = computed(() => auth.user?.role?.toLowerCase() ?? 'client');

const visibleAlerts = computed(() => {
  const r = role.value;
  return store.alerts.filter(a => {
    if (r === 'admin') return a.type === 'admin' || a.type === 'system';
    return a.type === 'client';
  });
});

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)   return t('alerts.time.moment');
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return t(m === 1 ? 'alerts.time.minute' : 'alerts.time.minutes', { count: m });
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return t(h === 1 ? 'alerts.time.hour' : 'alerts.time.hours', { count: h });
  }
  const d = Math.floor(diff / 86400);
  return t(d === 1 ? 'alerts.time.day' : 'alerts.time.days', { count: d });
}

const ICON_COLOR = { warning: 'var(--accent)', wifi_off: 'var(--red)', person: 'var(--blue)', timer_off: 'var(--red)' };

function iconColor(icon) { return ICON_COLOR[icon] ?? 'var(--text-secondary)'; }

function markAllRead() { store.markReadForRole(role.value); }
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('nav.alerts') }}</h1>
      <button v-if="visibleAlerts.length" class="btn btn--outline" style="font-size:.8rem" @click="markAllRead">
        <span class="material-icons" style="font-size:15px">done_all</span>
        {{ t('alerts.markAllRead') }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="!visibleAlerts.length" class="empty-state card">
      <span class="material-icons empty-icon">notifications_none</span>
      <p class="empty-label">{{ t('alerts.emptyState') }}</p>
    </div>

    <!-- Alert cards -->
    <div v-else class="alerts-grid">
      <div v-for="alert in visibleAlerts" :key="alert.id"
        class="card alert-card" :class="{ 'alert-card--unread': !alert.read[role] }">

        <div class="alert-icon-wrap" :style="{ background: iconColor(alert.icon) + '18' }">
          <span class="material-icons alert-icon" :style="{ color: iconColor(alert.icon) }">{{ alert.icon }}</span>
        </div>

        <div class="alert-body">
          <p class="alert-title">{{ t(alert.title) || alert.title }}</p>
          <p class="alert-desc">{{ t(alert.description) || alert.description }}</p>
          <p class="alert-time">{{ timeAgo(alert.timestamp) }}</p>
        </div>

        <div class="alert-actions">
          <button v-if="alert.link" class="btn btn--outline btn--xs" @click="router.push(alert.link)">
            {{ t('alerts.detailsBtn') }}
          </button>
          <button class="btn btn--ghost btn--xs" :title="t('alerts.deleteTitle')" @click="store.deleteAlert(alert.id)">
            <span class="material-icons" style="font-size:16px">delete_outline</span>
          </button>
        </div>

        <div v-if="!alert.read[role]" class="unread-dot"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page__header { align-items: center; display: flex; justify-content: space-between; margin-bottom: 1.25rem; }
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .75rem; padding: 3rem; text-align: center; }
.empty-icon { color: var(--text-secondary); font-size: 48px; }
.empty-label { color: var(--text-secondary); font-size: .9rem; }
.alerts-grid { display: flex; flex-direction: column; gap: .75rem; }
.alert-card { align-items: flex-start; display: flex; gap: 1rem; padding: 1rem; position: relative; transition: background .15s; }
.alert-card--unread { border-left: 3px solid var(--accent); }
.alert-icon-wrap { align-items: center; border-radius: 10px; display: flex; flex-shrink: 0; height: 44px; justify-content: center; width: 44px; }
.alert-icon { font-size: 22px; }
.alert-body { display: flex; flex: 1; flex-direction: column; gap: .25rem; min-width: 0; }
.alert-title { font-size: .88rem; font-weight: 600; }
.alert-desc  { color: var(--text-secondary); font-size: .8rem; }
.alert-time  { color: var(--text-secondary); font-size: .72rem; margin-top: .2rem; }
.alert-actions { align-items: center; display: flex; flex-direction: column; gap: .35rem; flex-shrink: 0; }
.btn--xs { font-size: .75rem; padding: .2rem .55rem; white-space: nowrap; }
.btn--ghost { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.btn--ghost:hover { color: var(--red); }
.unread-dot { background: var(--accent); border-radius: 50%; height: 8px; position: absolute; right: .75rem; top: .75rem; width: 8px; }
</style>
