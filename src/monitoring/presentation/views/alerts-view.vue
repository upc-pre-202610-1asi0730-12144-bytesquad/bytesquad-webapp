<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlertsStore } from '@/monitoring/application/alerts.store.js';

const { t } = useI18n();
const store = useAlertsStore();

onMounted(() => store.load());

const sortedAlerts = computed(() =>
  [...store.alerts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
);

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

const SEVERITY_ICON  = { Info: 'info', Warning: 'warning', Critical: 'error' };
const SEVERITY_COLOR = { Info: 'var(--blue)', Warning: 'var(--accent)', Critical: 'var(--red)' };
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('nav.alerts') }}</h1>
    </div>

    <!-- Empty state -->
    <div v-if="!store.loading && !sortedAlerts.length" class="empty-state card">
      <span class="material-icons empty-icon">notifications_none</span>
      <p class="empty-label">{{ t('alerts.emptyState') }}</p>
    </div>

    <!-- Alert cards -->
    <div v-else class="alerts-grid">
      <div v-for="alert in sortedAlerts" :key="alert.id"
        class="card alert-card" :class="{ 'alert-card--unread': !alert.resolved }">

        <div class="alert-icon-wrap" :style="{ background: SEVERITY_COLOR[alert.severity] + '18' }">
          <span class="material-icons alert-icon" :style="{ color: SEVERITY_COLOR[alert.severity] }">
            {{ SEVERITY_ICON[alert.severity] ?? 'notifications' }}
          </span>
        </div>

        <div class="alert-body">
          <p class="alert-title">{{ alert.message }}</p>
          <p class="alert-time">{{ timeAgo(alert.createdAt) }}</p>
        </div>

        <div class="alert-actions">
          <button v-if="!alert.resolved" class="btn btn--outline btn--xs" @click="store.resolve(alert.id)">
            {{ t('alerts.resolve') }}
          </button>
          <span v-else class="resolved-badge">{{ t('alerts.resolved') }}</span>
        </div>

        <div v-if="!alert.resolved" class="unread-dot"></div>
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
.alert-time  { color: var(--text-secondary); font-size: .72rem; margin-top: .2rem; }
.alert-actions { align-items: center; display: flex; flex-direction: column; gap: .35rem; flex-shrink: 0; }
.btn--xs { font-size: .75rem; padding: .2rem .55rem; white-space: nowrap; }
.resolved-badge { color: var(--green); font-size: .75rem; font-weight: 600; }
.unread-dot { background: var(--accent); border-radius: 50%; height: 8px; position: absolute; right: .75rem; top: .75rem; width: 8px; }
</style>
