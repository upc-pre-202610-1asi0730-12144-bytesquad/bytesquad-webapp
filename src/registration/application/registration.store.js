import { defineStore } from 'pinia';
import { ref } from 'vue';
import { RegistrationApi } from '../infrastructure/registration-api.js';

const api = new RegistrationApi();

export const useRegistrationStore = defineStore('registration', () => {
  const loading = ref(false);
  const error   = ref(null);

  async function registerBusiness(data) {
    loading.value = true; error.value = null;
    try {
      const { checkoutUrl } = await api.registerBusiness(data);
      window.location.href = checkoutUrl;
    } catch (e) {
      error.value = e.message || 'Registration failed. Please try again.';
    } finally { loading.value = false; }
  }

  function clearError() { error.value = null; }

  return { loading, error, registerBusiness, clearError };
});
