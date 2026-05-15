<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfigurationStore } from '@/configuration/application/configuration.store.js';
import { AlertType } from '@/configuration/domain/model/configuration.entity.js';

const { t } = useI18n();
const store = useConfigurationStore();

const ALERT_TYPE_LABELS = {
  [AlertType.SENSOR_DISCONNECTED]: { label: t('configuration.notifications.alertType.offlineSensors'),   desc: t('configuration.notifications.alertType.descriptionOfflineSensors') },
  [AlertType.LOW_BATTERY]:         { label: t('configuration.notifications.alertType.lowBattery'),        desc: t('configuration.notifications.alertType.descriptionLowBattery') },
  [AlertType.MAINTENANCE_DUE]:     { label: t('configuration.notifications.alertType.preventiveMaintenance'), desc: t('configuration.notifications.alertType.descriptionPreventiveMaintenance') },
  [AlertType.HIGH_WEAR]:           { label: t('configuration.notifications.alertType.weeklyReports'),     desc: t('configuration.notifications.alertType.descriptionWeeklyReports') },
  [AlertType.SYSTEM_ERROR]:        { label: t('configuration.notifications.alertType.weeklyReports'),     desc: t('configuration.notifications.alertType.descriptionWeeklyReports') },
};

const PING_OPTIONS = [5, 10, 15, 30, 60];
const CURRENCIES = ['USD', 'EUR', 'PEN', 'MXN', 'COP'];

const localEmail = ref(store.notificationEmail);

function isAlertEnabled(type) { return store.enabledAlertTypes.includes(type); }
function toggleAlert(type) {
  const cur = [...store.enabledAlertTypes];
  const idx = cur.indexOf(type);
  if (idx === -1) cur.push(type);
  else cur.splice(idx, 1);
  store.setEnabledAlertTypes(cur);
}
function onEmailChange() { store.setNotificationEmail(localEmail.value); }

async function save() { await store.saveConfiguration(); }
function cancel()     { store.reloadConfiguration(); localEmail.value = store.notificationEmail; }
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('configuration.title') }}</h1>
      <p class="page__subtitle">{{ t('configuration.subtitle') }}</p>
    </div>

    <!-- Maintenance Thresholds -->
    <div class="card section">
      <h2 class="section-title">{{ t('configuration.maintenanceThresholds.title') }}</h2>
      <p class="section-sub">{{ t('configuration.maintenanceThresholds.subtitle') }}</p>

      <div class="field-group">
        <div class="field">
          <div class="field-header">
            <label>{{ t('configuration.maintenanceThresholds.criticalHour') }}</label>
            <span class="field-val">{{ store.maintenanceThresholds.criticalUsageHours }}h</span>
          </div>
          <p class="field-desc">{{ t('configuration.maintenanceThresholds.descriptionCriticalHour') }}</p>
          <input type="range" min="100" max="1000" step="50" :value="store.maintenanceThresholds.criticalUsageHours"
            @input="store.updateMaintenanceThresholds({ criticalUsageHours: +$event.target.value })" />
          <div class="range-labels"><span>100h</span><span>1000h</span></div>
        </div>

        <div class="field">
          <div class="field-header">
            <label>{{ t('configuration.maintenanceThresholds.inactiveTime') }}</label>
            <span class="field-val">{{ store.maintenanceThresholds.maxInactiveTime }} min</span>
          </div>
          <p class="field-desc">{{ t('configuration.maintenanceThresholds.descriptionInactiveTime') }}</p>
          <input type="range" min="5" max="60" step="5" :value="store.maintenanceThresholds.maxInactiveTime"
            @input="store.updateMaintenanceThresholds({ maxInactiveTime: +$event.target.value })" />
          <div class="range-labels"><span>5 min</span><span>60 min</span></div>
        </div>

        <div class="field">
          <div class="field-header">
            <label>{{ t('configuration.maintenanceThresholds.peakHourBuffer') }}</label>
            <span class="field-val">{{ store.maintenanceThresholds.peakHoursBuffer }}h</span>
          </div>
          <p class="field-desc">{{ t('configuration.maintenanceThresholds.descriptionPeakHourBuffer') }}</p>
          <input type="range" min="0" max="72" step="4" :value="store.maintenanceThresholds.peakHoursBuffer"
            @input="store.updateMaintenanceThresholds({ peakHoursBuffer: +$event.target.value })" />
          <div class="range-labels"><span>0h</span><span>72h</span></div>
        </div>
      </div>

      <div class="scheduler-note">
        <span class="material-icons" style="color:var(--accent)">smart_toy</span>
        <div>
          <p class="note-title">{{ t('configuration.maintenanceThresholds.note') }}</p>
          <p class="note-desc">{{ t('configuration.maintenanceThresholds.descriptionNote') }}</p>
        </div>
        <label class="toggle">
          <input type="checkbox" :checked="store.intelligentScheduling" @change="store.setIntelligentScheduling($event.target.checked)" />
          <span class="toggle-track"></span>
        </label>
      </div>
    </div>

    <!-- IoT Configuration -->
    <div class="card section">
      <h2 class="section-title">{{ t('configuration.configurationIoT.title') }}</h2>
      <p class="section-sub">{{ t('configuration.configurationIoT.subtitle') }}</p>

      <div class="iot-grid">
        <div class="field">
          <div class="field-header">
            <label>{{ t('configuration.configurationIoT.lowBattery') }}</label>
            <span class="field-val">{{ store.iotConfig.lowBatteryThreshold }}%</span>
          </div>
          <p class="field-desc">{{ t('configuration.configurationIoT.descriptionLowBattery') }}</p>
          <input type="range" min="5" max="50" step="5" :value="store.iotConfig.lowBatteryThreshold"
            @input="store.updateIoTConfig({ lowBatteryThreshold: +$event.target.value })" />
          <div class="range-labels"><span>5%</span><span>50%</span></div>
        </div>

        <div class="field">
          <label>{{ t('configuration.configurationIoT.ping') }}</label>
          <p class="field-desc">{{ t('configuration.configurationIoT.DescriptionPing') }}</p>
          <div class="ping-options">
            <button v-for="sec in PING_OPTIONS" :key="sec"
              class="btn ping-btn" :class="store.iotConfig.pingInterval === sec ? 'btn--accent' : 'btn--outline'"
              @click="store.updateIoTConfig({ pingInterval: sec })">
              {{ sec }}s
            </button>
          </div>
        </div>

        <div class="field">
          <div class="field-header">
            <label>{{ t('configuration.configurationIoT.graceTime') }}</label>
            <span class="field-val">{{ store.iotConfig.offlineGracePeriod }} min</span>
          </div>
          <p class="field-desc">{{ t('configuration.configurationIoT.descriptionGraceTime') }}</p>
          <input type="range" min="1" max="30" step="1" :value="store.iotConfig.offlineGracePeriod"
            @input="store.updateIoTConfig({ offlineGracePeriod: +$event.target.value })" />
          <div class="range-labels"><span>1 min</span><span>30 min</span></div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="card section">
      <h2 class="section-title">{{ t('configuration.notifications.title') }}</h2>
      <p class="section-sub">{{ t('configuration.notifications.subtitle') }}</p>

      <div class="field" style="max-width:400px;margin-bottom:1.25rem">
        <label>{{ t('configuration.notifications.emailNotification') }}</label>
        <p class="field-desc">{{ t('configuration.notifications.descriptionEmailNotification') }}</p>
        <input type="email" v-model="localEmail" @blur="onEmailChange" />
      </div>

      <p class="field-label">{{ t('configuration.notifications.alertType.title') }}</p>
      <div class="alert-types">
        <div v-for="type in Object.values(AlertType)" :key="type" class="alert-toggle-row">
          <div class="alert-toggle-info">
            <span class="alert-toggle-label">{{ ALERT_TYPE_LABELS[type]?.label ?? type }}</span>
            <span class="alert-toggle-desc">{{ ALERT_TYPE_LABELS[type]?.desc }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" :checked="isAlertEnabled(type)" @change="toggleAlert(type)" />
            <span class="toggle-track"></span>
          </label>
        </div>
      </div>
    </div>

    <!-- Financial Configuration -->
    <div class="card section">
      <h2 class="section-title">{{ t('configuration.financialConfiguration.title') }}</h2>
      <p class="section-sub">{{ t('configuration.financialConfiguration.subtitle') }}</p>

      <div class="fin-grid">
        <div class="field">
          <label>{{ t('configuration.financialConfiguration.averageCostHourDowntime') }}</label>
          <p class="field-desc">{{ t('configuration.financialConfiguration.descriptionAverageCostHourDowntime') }}</p>
          <div class="input-prefix-wrap">
            <span class="input-prefix">$</span>
            <input type="number" min="0" step="1" :value="store.financialConfig.costPerHourDowntime"
              @input="store.updateFinancialConfig({ costPerHourDowntime: +$event.target.value })" />
          </div>
        </div>

        <div class="field">
          <label>{{ t('configuration.financialConfiguration.averageMonthlyMembership') }}</label>
          <p class="field-desc">{{ t('configuration.financialConfiguration.descriptionAverageMonthlyMembership') }}</p>
          <div class="input-prefix-wrap">
            <span class="input-prefix">$</span>
            <input type="number" min="0" step="1" :value="store.financialConfig.monthlyMembership"
              @input="store.updateFinancialConfig({ monthlyMembership: +$event.target.value })" />
          </div>
        </div>

        <div class="field">
          <label>{{ t('configuration.financialConfiguration.systemCurrency') }}</label>
          <select :value="store.financialConfig.systemCurrency"
            @change="store.updateFinancialConfig({ systemCurrency: $event.target.value })">
            <option v-for="c in CURRENCIES" :key="c" :value="c">
              {{ t(`configuration.financialConfiguration.moneySystemCurrency.${c}`) }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Footer actions -->
    <div class="footer-actions">
      <button class="btn btn--outline" @click="cancel" :disabled="store.loading">{{ t('configuration.cancel') }}</button>
      <button class="btn btn--accent" @click="save" :disabled="store.loading || !store.isDirty">
        <span v-if="store.loading" class="material-icons spin" style="font-size:16px">sync</span>
        {{ t('configuration.saveChanges') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.page__subtitle { color: var(--text-secondary); font-size: .85rem; margin-top: .25rem; margin-bottom: 1.25rem; }
.section { margin-bottom: 1rem; }
.section-title { font-size: .95rem; font-weight: 600; margin-bottom: .25rem; }
.section-sub { color: var(--text-secondary); font-size: .82rem; margin-bottom: 1rem; }
.field-group { display: grid; gap: 1.25rem; }
.field { display: flex; flex-direction: column; gap: .375rem; }
.field-header { display: flex; justify-content: space-between; align-items: center; }
.field-header label { font-size: .85rem; font-weight: 500; }
.field-val { color: var(--accent); font-size: .82rem; font-weight: 600; }
.field-desc { color: var(--text-secondary); font-size: .78rem; margin-top: -.25rem; }
.field-label { color: var(--text-secondary); font-size: .8rem; font-weight: 500; margin-bottom: .5rem; }
input[type="range"] { width: 100%; accent-color: var(--accent); cursor: pointer; }
.range-labels { display: flex; justify-content: space-between; color: var(--text-secondary); font-size: .7rem; }
.scheduler-note { align-items: flex-start; background: rgba(245,188,54,.07); border: 1px solid rgba(245,188,54,.2); border-radius: 8px; display: flex; gap: .75rem; margin-top: 1rem; padding: .75rem 1rem; }
.note-title { font-size: .85rem; font-weight: 600; }
.note-desc  { color: var(--text-secondary); font-size: .78rem; margin-top: .2rem; }
.iot-grid { display: grid; gap: 1.25rem; grid-template-columns: 1fr 1fr 1fr; }
.ping-options { display: flex; gap: .5rem; flex-wrap: wrap; margin-top: .25rem; }
.ping-btn { padding: .25rem .75rem; font-size: .8rem; }
.btn--accent { background: var(--accent); border: none; color: #000; font-weight: 600; padding: .5rem 1.25rem; border-radius: 6px; cursor: pointer; }
.btn--accent:disabled { opacity: .5; cursor: default; }
.alert-types { display: flex; flex-direction: column; gap: .75rem; }
.alert-toggle-row { align-items: center; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; padding-bottom: .75rem; }
.alert-toggle-info { display: flex; flex-direction: column; gap: .15rem; }
.alert-toggle-label { font-size: .85rem; font-weight: 500; }
.alert-toggle-desc  { color: var(--text-secondary); font-size: .78rem; }
.toggle { cursor: pointer; display: inline-flex; align-items: center; }
.toggle input { display: none; }
.toggle-track { background: var(--border); border-radius: 12px; height: 22px; position: relative; transition: background .2s; width: 44px; }
.toggle input:checked + .toggle-track { background: var(--accent); }
.toggle-track::after { background: #fff; border-radius: 50%; content: ''; height: 16px; left: 3px; position: absolute; top: 3px; transition: transform .2s; width: 16px; }
.toggle input:checked + .toggle-track::after { transform: translateX(22px); }
.fin-grid { display: grid; gap: 1.25rem; grid-template-columns: 1fr 1fr 1fr; }
.input-prefix-wrap { position: relative; }
.input-prefix { color: var(--text-secondary); font-size: .85rem; left: .75rem; position: absolute; top: 50%; transform: translateY(-50%); }
.input-prefix-wrap input { padding-left: 1.75rem; width: 100%; }
.footer-actions { display: flex; gap: .75rem; justify-content: flex-end; margin-top: .5rem; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 900px) { .iot-grid, .fin-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .iot-grid, .fin-grid { grid-template-columns: 1fr; } }
</style>
