<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfigurationStore } from '@/configuration/application/configuration.store.js';

const { t } = useI18n();
const store = useConfigurationStore();

const saved = ref(false);

onMounted(() => store.load());

async function save() {
  saved.value = false;
  const ok = await store.save();
  if (ok) saved.value = true;
}
</script>

<template>
  <div class="page cfg-page">

    <div style="margin-bottom:1.25rem">
      <h1 class="page__title">{{ t('configuration.title') }}</h1>
      <p class="cfg-subtitle">{{ t('configuration.subtitle') }}</p>
    </div>

    <div class="card cfg-card">
      <div class="cfg-section-header">
        <span class="material-icons cfg-section-icon">notifications</span>
        <div>
          <h2 class="cfg-section-title">{{ t('configuration.notifications.title') }}</h2>
          <p class="cfg-section-sub">{{ t('configuration.notifications.subtitle') }}</p>
        </div>
      </div>

      <div class="alert-types">
        <div class="alert-row">
          <div class="alert-info">
            <span class="alert-name">{{ t('configuration.notifications.notifyOnCritical') }}</span>
            <span class="alert-desc">{{ t('configuration.notifications.descriptionNotifyOnCritical') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="store.notifyOnCritical" />
            <span class="toggle-track"></span>
          </label>
        </div>
        <div class="alert-row">
          <div class="alert-info">
            <span class="alert-name">{{ t('configuration.notifications.notifyOnWarning') }}</span>
            <span class="alert-desc">{{ t('configuration.notifications.descriptionNotifyOnWarning') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="store.notifyOnWarning" />
            <span class="toggle-track"></span>
          </label>
        </div>
      </div>

      <div class="field" style="margin-top:.5rem">
        <label class="field-label">{{ t('configuration.notifications.emailNotification') }}</label>
        <input type="email" v-model="store.notificationEmail" :placeholder="t('configuration.notifications.emailPlaceholder')" />
        <p class="field-desc">{{ t('configuration.notifications.descriptionEmailNotification') }}</p>
      </div>

      <div v-if="store.error" class="alert alert--error">{{ store.error }}</div>
      <div v-if="saved" class="alert alert--success">{{ t('configuration.saved') }}</div>

      <button class="btn btn--accent" style="align-self:flex-start" @click="save" :disabled="store.loading">
        <span v-if="store.loading" class="material-icons spin" style="font-size:16px">sync</span>
        <span class="material-icons" v-else style="font-size:16px">save</span>
        {{ t('configuration.saveChanges') }}
      </button>
    </div>

  </div>
</template>

<style scoped>
.cfg-page   { display: flex; flex-direction: column; gap: 1rem; }
.cfg-subtitle { color: var(--text-secondary); font-size: .82rem; margin-top: .2rem; }
.cfg-card { display: flex; flex-direction: column; gap: 1.25rem; max-width: 560px; }

.cfg-section-header { align-items: flex-start; display: flex; gap: .65rem; margin-bottom: .25rem; }
.cfg-section-icon   { color: var(--accent); font-size: 20px; margin-top: 1px; flex-shrink: 0; }
.cfg-section-title  { font-size: .92rem; font-weight: 700; }
.cfg-section-sub    { color: var(--text-secondary); font-size: .78rem; margin-top: .15rem; }

.field { display: flex; flex-direction: column; gap: .35rem; }
.field-label { font-size: .84rem; font-weight: 500; }
.field-desc  { color: var(--text-secondary); font-size: .75rem; }
.field input[type="email"] { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-primary); font-size: .875rem; padding: .5rem .75rem; }
.field input[type="email"]:focus { border-color: var(--accent); outline: none; }

.alert-types { display: flex; flex-direction: column; }
.alert-row   { align-items: center; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; padding: .65rem 0; }
.alert-row:last-child { border-bottom: none; }
.alert-info  { display: flex; flex-direction: column; gap: .1rem; }
.alert-name  { font-size: .84rem; font-weight: 600; }
.alert-desc  { color: var(--text-secondary); font-size: .75rem; }

.toggle { align-items: center; cursor: pointer; display: inline-flex; flex-shrink: 0; }
.toggle input { display: none; }
.toggle-track { background: var(--border); border-radius: 12px; height: 22px; position: relative; transition: background .2s; width: 44px; flex-shrink: 0; }
.toggle input:checked + .toggle-track { background: var(--accent); }
.toggle-track::after { background: #fff; border-radius: 50%; content: ''; height: 16px; left: 3px; position: absolute; top: 3px; transition: transform .2s; width: 16px; }
.toggle input:checked + .toggle-track::after { transform: translateX(22px); }

.alert { border-radius: var(--radius); font-size: .8rem; padding: .5rem .75rem; }
.alert--error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: var(--red); }
.alert--success { background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3); color: var(--green); }

.btn--accent { align-items: center; background: var(--accent); border: none; border-radius: var(--radius); color: #000; cursor: pointer; display: flex; font-size: .875rem; font-weight: 600; gap: .35rem; padding: .5rem 1.25rem; }
.btn--accent:disabled { cursor: default; opacity: .5; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
