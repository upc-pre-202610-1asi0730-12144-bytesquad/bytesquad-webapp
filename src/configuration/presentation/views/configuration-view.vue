<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfigurationStore } from '@/configuration/application/configuration.store.js';
import { AlertType } from '@/configuration/domain/model/configuration.entity.js';

const { t } = useI18n();
const store = useConfigurationStore();

const ALERT_TYPES = [
  { type: AlertType.MAINTENANCE_DUE,     labelKey: 'preventiveMaintenance', descKey: 'descriptionPreventiveMaintenance' },
  { type: AlertType.SENSOR_DISCONNECTED, labelKey: 'offlineSensors',        descKey: 'descriptionOfflineSensors' },
  { type: AlertType.LOW_BATTERY,         labelKey: 'lowBattery',            descKey: 'descriptionLowBattery' },
  { type: AlertType.HIGH_WEAR,           labelKey: 'weeklyReports',         descKey: 'descriptionWeeklyReports' },
];

const PING_OPTIONS = [
  { value: 5,  labelKey: '5s'  },
  { value: 10, labelKey: '10s' },
  { value: 15, labelKey: '15s' },
  { value: 30, labelKey: '30s' },
  { value: 60, labelKey: '60s' },
];

const CURRENCIES = [
  { code: 'USD', label: 'USD - United States Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'PEN', label: 'PEN - Sol Peruano' },
  { code: 'MXN', label: 'MXN - Peso Mexicano' },
  { code: 'COP', label: 'COP - Peso Colombiano' },
];

const localEmail = ref(store.notificationEmail);

function isAlertEnabled(type) { return store.enabledAlertTypes.includes(type); }
function toggleAlert(type) {
  const cur = [...store.enabledAlertTypes];
  const idx = cur.indexOf(type);
  if (idx === -1) cur.push(type); else cur.splice(idx, 1);
  store.setEnabledAlertTypes(cur);
}
function onEmailChange() { store.setNotificationEmail(localEmail.value); }
async function save()  { await store.saveConfiguration(); }
function cancel()      { store.reloadConfiguration(); localEmail.value = store.notificationEmail; }
</script>

<template>
  <div class="page cfg-page">

    <!-- Header -->
    <div style="margin-bottom:1.25rem">
      <h1 class="page__title">{{ t('configuration.title') }}</h1>
      <p class="cfg-subtitle">{{ t('configuration.subtitle') }}</p>
    </div>

    <!-- 2-column grid -->
    <div class="cfg-grid">

      <!-- ── Maintenance Thresholds ──────────────────────────────────────── -->
      <div class="card cfg-card">
        <div class="cfg-section-header">
          <span class="material-icons cfg-section-icon">build</span>
          <div>
            <h2 class="cfg-section-title">{{ t('configuration.maintenanceThresholds.title') }}</h2>
            <p class="cfg-section-sub">{{ t('configuration.maintenanceThresholds.subtitle') }}</p>
          </div>
        </div>

        <!-- Critical Usage Hours -->
        <div class="field">
          <div class="field-row">
            <label class="field-label">{{ t('configuration.maintenanceThresholds.criticalHour') }}</label>
            <span class="field-badge">{{ store.maintenanceThresholds.criticalUsageHours }}h</span>
          </div>
          <input type="range" min="100" max="1000" step="50"
            :value="store.maintenanceThresholds.criticalUsageHours"
            @input="store.updateMaintenanceThresholds({ criticalUsageHours: +$event.target.value })" />
          <p class="field-desc">{{ t('configuration.maintenanceThresholds.descriptionCriticalHour') }}</p>
        </div>

        <!-- Max Inactive Time -->
        <div class="field">
          <div class="field-row">
            <label class="field-label">{{ t('configuration.maintenanceThresholds.inactiveTime') }}</label>
            <span class="field-badge">{{ store.maintenanceThresholds.maxInactiveTime }} min</span>
          </div>
          <input type="range" min="5" max="60" step="5"
            :value="store.maintenanceThresholds.maxInactiveTime"
            @input="store.updateMaintenanceThresholds({ maxInactiveTime: +$event.target.value })" />
          <p class="field-desc">{{ t('configuration.maintenanceThresholds.descriptionInactiveTime') }}</p>
        </div>

        <!-- Peak Hours Buffer -->
        <div class="field">
          <div class="field-row">
            <label class="field-label">{{ t('configuration.maintenanceThresholds.peakHourBuffer') }}</label>
            <span class="field-badge">{{ store.maintenanceThresholds.peakHoursBuffer }}h</span>
          </div>
          <input type="range" min="0" max="72" step="4"
            :value="store.maintenanceThresholds.peakHoursBuffer"
            @input="store.updateMaintenanceThresholds({ peakHoursBuffer: +$event.target.value })" />
          <p class="field-desc">{{ t('configuration.maintenanceThresholds.descriptionPeakHourBuffer') }}</p>
        </div>

        <!-- Smart Scheduler toggle -->
        <div class="scheduler-note">
          <span class="material-icons" style="color:var(--accent);flex-shrink:0">smart_toy</span>
          <div class="scheduler-body">
            <p class="scheduler-title">{{ t('configuration.maintenanceThresholds.note') }}</p>
            <p class="scheduler-desc">{{ t('configuration.maintenanceThresholds.descriptionNote') }}</p>
          </div>
          <label class="toggle">
            <input type="checkbox" :checked="store.intelligentScheduling"
              @change="store.setIntelligentScheduling($event.target.checked)" />
            <span class="toggle-track"></span>
          </label>
        </div>
      </div>

      <!-- ── IoT Configuration ───────────────────────────────────────────── -->
      <div class="card cfg-card">
        <div class="cfg-section-header">
          <span class="material-icons cfg-section-icon">sensors</span>
          <div>
            <h2 class="cfg-section-title">{{ t('configuration.configurationIoT.title') }}</h2>
            <p class="cfg-section-sub">{{ t('configuration.configurationIoT.subtitle') }}</p>
          </div>
        </div>

        <!-- Low Battery Threshold -->
        <div class="field">
          <div class="field-row">
            <label class="field-label">{{ t('configuration.configurationIoT.lowBattery') }}</label>
            <span class="field-badge field-badge--red">{{ store.iotConfig.lowBatteryThreshold }}%</span>
          </div>
          <input type="range" min="5" max="50" step="5" class="range--red"
            :value="store.iotConfig.lowBatteryThreshold"
            @input="store.updateIoTConfig({ lowBatteryThreshold: +$event.target.value })" />
          <p class="field-desc">{{ t('configuration.configurationIoT.descriptionLowBattery') }}</p>
        </div>

        <!-- Ping Interval -->
        <div class="field">
          <label class="field-label">{{ t('configuration.configurationIoT.ping') }}</label>
          <select :value="store.iotConfig.pingInterval"
            @change="store.updateIoTConfig({ pingInterval: +$event.target.value })">
            <option v-for="opt in PING_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.value }} {{ t('configuration.configurationIoT.seconds') }}{{ opt.value === 10 ? ' (recommended)' : '' }}
            </option>
          </select>
          <p class="field-desc">{{ t('configuration.configurationIoT.DescriptionPing') }}</p>
        </div>

        <!-- Offline Grace Period -->
        <div class="field">
          <label class="field-label">{{ t('configuration.configurationIoT.graceTime') }}</label>
          <input type="number" min="1" max="60"
            :value="store.iotConfig.offlineGracePeriod"
            @input="store.updateIoTConfig({ offlineGracePeriod: +$event.target.value })" />
          <p class="field-desc">{{ t('configuration.configurationIoT.descriptionGraceTime') }}</p>
        </div>
      </div>

      <!-- ── Notifications ───────────────────────────────────────────────── -->
      <div class="card cfg-card">
        <div class="cfg-section-header">
          <span class="material-icons cfg-section-icon">notifications</span>
          <div>
            <h2 class="cfg-section-title">{{ t('configuration.notifications.title') }}</h2>
            <p class="cfg-section-sub">{{ t('configuration.notifications.subtitle') }}</p>
          </div>
        </div>

        <!-- Email -->
        <div class="field" style="margin-bottom:1.25rem">
          <label class="field-label">{{ t('configuration.notifications.emailNotification') }}</label>
          <input type="email" v-model="localEmail" @blur="onEmailChange" />
          <p class="field-desc">{{ t('configuration.notifications.descriptionEmailNotification') }}</p>
        </div>

        <!-- Alert Types -->
        <p class="alerts-header">{{ t('configuration.notifications.alertType.title') }}</p>
        <div class="alert-types">
          <div v-for="row in ALERT_TYPES" :key="row.type" class="alert-row">
            <div class="alert-info">
              <span class="alert-name">{{ t(`configuration.notifications.alertType.${row.labelKey}`) }}</span>
              <span class="alert-desc">{{ t(`configuration.notifications.alertType.${row.descKey}`) }}</span>
            </div>
            <label class="toggle">
              <input type="checkbox" :checked="isAlertEnabled(row.type)" @change="toggleAlert(row.type)" />
              <span class="toggle-track"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- ── Financial Configuration ─────────────────────────────────────── -->
      <div class="card cfg-card">
        <div class="cfg-section-header">
          <span class="material-icons cfg-section-icon">attach_money</span>
          <div>
            <h2 class="cfg-section-title">{{ t('configuration.financialConfiguration.title') }}</h2>
            <p class="cfg-section-sub">{{ t('configuration.financialConfiguration.subtitle') }}</p>
          </div>
        </div>

        <!-- Cost per hour downtime -->
        <div class="field">
          <label class="field-label">{{ t('configuration.financialConfiguration.averageCostHourDowntime') }}</label>
          <div class="prefix-wrap">
            <span class="prefix">$</span>
            <input type="number" min="0" step="1"
              :value="store.financialConfig.costPerHourDowntime"
              @input="store.updateFinancialConfig({ costPerHourDowntime: +$event.target.value })" />
          </div>
          <p class="field-desc">{{ t('configuration.financialConfiguration.descriptionAverageCostHourDowntime') }}</p>
        </div>

        <!-- Monthly membership -->
        <div class="field">
          <label class="field-label">{{ t('configuration.financialConfiguration.averageMonthlyMembership') }}</label>
          <div class="prefix-wrap">
            <span class="prefix">$</span>
            <input type="number" min="0" step="1"
              :value="store.financialConfig.monthlyMembership"
              @input="store.updateFinancialConfig({ monthlyMembership: +$event.target.value })" />
          </div>
          <p class="field-desc">{{ t('configuration.financialConfiguration.descriptionAverageMonthlyMembership') }}</p>
        </div>

        <!-- Currency -->
        <div class="field">
          <label class="field-label">{{ t('configuration.financialConfiguration.systemCurrency') }}</label>
          <select :value="store.financialConfig.systemCurrency"
            @change="store.updateFinancialConfig({ systemCurrency: $event.target.value })">
            <option v-for="c in CURRENCIES" :key="c.code" :value="c.code">{{ c.label }}</option>
          </select>
        </div>
      </div>

    </div><!-- /cfg-grid -->

    <!-- ── Sticky footer ─────────────────────────────────────────────────── -->
    <div class="cfg-footer">
      <button class="btn btn--outline" @click="cancel" :disabled="store.loading">
        {{ t('configuration.cancel') }}
      </button>
      <button class="btn btn--accent" @click="save" :disabled="store.loading || !store.isDirty">
        <span v-if="store.loading" class="material-icons spin" style="font-size:16px">sync</span>
        <span class="material-icons" v-else style="font-size:16px">save</span>
        {{ t('configuration.saveChanges') }}
      </button>
    </div>

  </div>
</template>

<style scoped>
.cfg-page   { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 80px; }
.cfg-subtitle { color: var(--text-secondary); font-size: .82rem; margin-top: .2rem; }

/* 2-column grid */
.cfg-grid { display: grid; gap: 1rem; grid-template-columns: 1.5fr 1fr; }
.cfg-card { display: flex; flex-direction: column; gap: 1.25rem; }

/* Section header */
.cfg-section-header { align-items: flex-start; display: flex; gap: .65rem; margin-bottom: .25rem; }
.cfg-section-icon   { color: var(--accent); font-size: 20px; margin-top: 1px; flex-shrink: 0; }
.cfg-section-title  { font-size: .92rem; font-weight: 700; }
.cfg-section-sub    { color: var(--text-secondary); font-size: .78rem; margin-top: .15rem; }

/* Fields */
.field { display: flex; flex-direction: column; gap: .35rem; }
.field-row  { align-items: center; display: flex; justify-content: space-between; }
.field-label { font-size: .84rem; font-weight: 500; }
.field-desc  { color: var(--text-secondary); font-size: .75rem; }
.field-badge { background: rgba(245,188,54,.15); border-radius: 5px; color: var(--accent); font-size: .75rem; font-weight: 700; padding: .1rem .45rem; }
.field-badge--red { background: rgba(239,68,68,.15); color: var(--red); }

/* Range inputs */
input[type="range"] { accent-color: var(--accent); cursor: pointer; width: 100%; }
.range--red { accent-color: var(--red); }

/* Scheduler note */
.scheduler-note  { align-items: flex-start; background: rgba(245,188,54,.07); border: 1px solid rgba(245,188,54,.2); border-radius: 8px; display: flex; gap: .75rem; padding: .75rem 1rem; }
.scheduler-body  { flex: 1; }
.scheduler-title { font-size: .84rem; font-weight: 600; }
.scheduler-desc  { color: var(--text-secondary); font-size: .75rem; margin-top: .2rem; }

/* Notifications */
.alerts-header { color: var(--text-secondary); font-size: .8rem; font-weight: 600; margin-bottom: .25rem; text-transform: uppercase; letter-spacing: .04em; }
.alert-types { display: flex; flex-direction: column; }
.alert-row   { align-items: center; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; padding: .65rem 0; }
.alert-row:last-child { border-bottom: none; }
.alert-info  { display: flex; flex-direction: column; gap: .1rem; }
.alert-name  { font-size: .84rem; font-weight: 600; }
.alert-desc  { color: var(--text-secondary); font-size: .75rem; }

/* Toggle */
.toggle { align-items: center; cursor: pointer; display: inline-flex; flex-shrink: 0; }
.toggle input { display: none; }
.toggle-track { background: var(--border); border-radius: 12px; height: 22px; position: relative; transition: background .2s; width: 44px; flex-shrink: 0; }
.toggle input:checked + .toggle-track { background: var(--accent); }
.toggle-track::after { background: #fff; border-radius: 50%; content: ''; height: 16px; left: 3px; position: absolute; top: 3px; transition: transform .2s; width: 16px; }
.toggle input:checked + .toggle-track::after { transform: translateX(22px); }

/* Prefix input */
.prefix-wrap { align-items: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); display: flex; gap: .5rem; padding: 0 .75rem; }
.prefix-wrap:focus-within { border-color: var(--accent); }
.prefix { color: var(--text-secondary); font-size: .85rem; flex-shrink: 0; }
.prefix-wrap input { background: transparent; border: none; color: var(--text-primary); flex: 1; font-size: .875rem; outline: none; padding: .5rem 0; }

/* Footer */
.cfg-footer { align-items: center; background: var(--bg-base); border-top: 1px solid var(--border); bottom: 0; display: flex; gap: .75rem; justify-content: flex-end; left: 0; padding: .85rem 1.5rem; position: fixed; right: 0; z-index: 50; }
.btn--accent { align-items: center; background: var(--accent); border: none; border-radius: var(--radius); color: #000; cursor: pointer; display: flex; font-size: .875rem; font-weight: 600; gap: .35rem; padding: .5rem 1.25rem; }
.btn--accent:disabled { cursor: default; opacity: .5; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .cfg-grid { grid-template-columns: 1fr; } }
</style>
