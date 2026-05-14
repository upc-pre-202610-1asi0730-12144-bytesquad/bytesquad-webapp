import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AlertType } from '../domain/model/configuration.entity.js';
import { ConfigurationApi } from '../infrastructure/configuration-api.js';

const api = new ConfigurationApi();

export const useConfigurationStore = defineStore('configuration', () => {
  const maintenanceThresholds = ref({ criticalUsageHours: 500, maxInactiveTime: 15, peakHoursBuffer: 32 });
  const iotConfig             = ref({ lowBatteryThreshold: 20, pingInterval: 10, offlineGracePeriod: 3 });
  const financialConfig       = ref({ costPerHourDowntime: 25, monthlyMembership: 89, systemCurrency: 'USD - Dólar Estadounidense' });
  const notificationEmail     = ref('admin@spottrack.com');
  const enabledAlertTypes     = ref(Object.values(AlertType));
  const intelligentScheduling = ref(true);
  const loading               = ref(false);
  const isDirty               = ref(false);

  const configuration = computed(() => ({
    maintenanceThresholds: maintenanceThresholds.value,
    iotConfig:             iotConfig.value,
    financialConfig:       financialConfig.value,
    notificationEmail:     notificationEmail.value,
    enabledAlertTypes:     enabledAlertTypes.value,
    intelligentScheduling: intelligentScheduling.value,
    lastUpdated:           new Date(),
  }));

  function updateMaintenanceThresholds(patch) {
    maintenanceThresholds.value = { ...maintenanceThresholds.value, ...patch };
    isDirty.value = true;
  }
  function updateIoTConfig(patch) {
    iotConfig.value = { ...iotConfig.value, ...patch };
    isDirty.value = true;
  }
  function updateFinancialConfig(patch) {
    financialConfig.value = { ...financialConfig.value, ...patch };
    isDirty.value = true;
  }
  function setNotificationEmail(email) { notificationEmail.value = email; isDirty.value = true; }
  function setEnabledAlertTypes(types) { enabledAlertTypes.value = types; isDirty.value = true; }
  function setIntelligentScheduling(v) { intelligentScheduling.value = v; isDirty.value = true; }

  async function saveConfiguration() {
    loading.value = true;
    try {
      await api.saveConfiguration(configuration.value);
      isDirty.value = false;
    } catch { /* use local state on failure */ }
    finally { loading.value = false; }
  }

  async function reloadConfiguration() {
    loading.value = true;
    try {
      const cfg = await api.getConfiguration();
      maintenanceThresholds.value = cfg.maintenanceThresholds;
      iotConfig.value             = cfg.iotConfig;
      financialConfig.value       = cfg.financialConfig;
      notificationEmail.value     = cfg.notificationEmail;
      enabledAlertTypes.value     = cfg.enabledAlertTypes;
      intelligentScheduling.value = cfg.intelligentScheduling;
      isDirty.value               = false;
    } catch { /* keep defaults */ }
    finally { loading.value = false; }
  }

  return { maintenanceThresholds, iotConfig, financialConfig, notificationEmail, enabledAlertTypes, intelligentScheduling, loading, isDirty, configuration, updateMaintenanceThresholds, updateIoTConfig, updateFinancialConfig, setNotificationEmail, setEnabledAlertTypes, setIntelligentScheduling, saveConfiguration, reloadConfiguration };
});
