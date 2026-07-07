import { defineStore } from 'pinia';
import { ref } from 'vue';
import { NotificationPreferencesApi } from '../infrastructure/notification-preferences-api.js';

const api = new NotificationPreferencesApi();

export const useConfigurationStore = defineStore('configuration', () => {
  const notifyOnCritical  = ref(true);
  const notifyOnWarning   = ref(true);
  const notificationEmail = ref('');
  const loading           = ref(false);
  const error             = ref(null);

  async function load() {
    loading.value = true; error.value = null;
    try {
      const prefs = await api.getCurrentUser();
      notifyOnCritical.value  = prefs.notifyOnCritical;
      notifyOnWarning.value   = prefs.notifyOnWarning;
      notificationEmail.value = prefs.notificationEmail;
    } catch (e) {
      error.value = e.message || 'Failed to load notification preferences';
    } finally { loading.value = false; }
  }

  async function save() {
    loading.value = true; error.value = null;
    try {
      const prefs = await api.updatePreferences({
        notifyOnCritical: notifyOnCritical.value,
        notifyOnWarning:  notifyOnWarning.value,
        notificationEmail: notificationEmail.value,
      });
      notifyOnCritical.value  = prefs.notifyOnCritical;
      notifyOnWarning.value   = prefs.notifyOnWarning;
      notificationEmail.value = prefs.notificationEmail;
      return true;
    } catch (e) {
      error.value = e.message || 'Failed to save notification preferences';
      return false;
    } finally { loading.value = false; }
  }

  return { notifyOnCritical, notifyOnWarning, notificationEmail, loading, error, load, save };
});
