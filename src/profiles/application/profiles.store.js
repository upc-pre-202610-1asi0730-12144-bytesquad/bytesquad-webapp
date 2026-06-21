import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ProfilesApi } from '../infrastructure/profiles-api.js';
import { useAuthStore } from '@/auth/application/auth.store.js';

const api = new ProfilesApi();

export const useProfilesStore = defineStore('profiles', () => {
  const myProfile      = ref(null);
  const adminProfiles  = ref([]);
  const clientProfiles = ref([]);
  const loading        = ref(false);
  const error          = ref(null);

  async function loadMyProfile() {
    const auth   = useAuthStore();
    const userId = auth.user?.id;
    if (!userId) return;
    loading.value = true; error.value = null;
    try {
      // TODO: replace with GET /profiles/admins?userId={id} or /profiles/clients?userId={id}
      //       when backend exposes a by-userId endpoint
      if (auth.isAdmin) {
        const list = await api.getAdmins();
        myProfile.value = list.find(p => p.userId === userId) ?? null;
      } else {
        const list = await api.getClients();
        myProfile.value = list.find(p => p.userId === userId) ?? null;
      }
    } catch (e) {
      error.value = e.message || 'Failed to load profile';
    } finally { loading.value = false; }
  }

  async function loadAllAdmins() {
    loading.value = true; error.value = null;
    try {
      adminProfiles.value = await api.getAdmins();
    } catch (e) {
      error.value = e.message || 'Failed to load admin profiles';
    } finally { loading.value = false; }
  }

  async function loadAllClients() {
    loading.value = true; error.value = null;
    try {
      clientProfiles.value = await api.getClients();
    } catch (e) {
      error.value = e.message || 'Failed to load client profiles';
    } finally { loading.value = false; }
  }

  async function createAdmin(dto) {
    loading.value = true; error.value = null;
    try {
      const created = await api.createAdmin(dto);
      adminProfiles.value = [...adminProfiles.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create admin profile';
    } finally { loading.value = false; }
  }

  async function createClient(dto) {
    loading.value = true; error.value = null;
    try {
      const created = await api.createClient(dto);
      clientProfiles.value = [...clientProfiles.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create client profile';
    } finally { loading.value = false; }
  }

  async function updateMyProfile(dto) {
    const auth = useAuthStore();
    if (!myProfile.value) return;
    loading.value = true; error.value = null;
    try {
      const updated = auth.isAdmin
        ? await api.updateAdmin(myProfile.value.id, dto)
        : await api.updateClient(myProfile.value.id, dto);
      myProfile.value = updated;
      return updated;
    } catch (e) {
      error.value = e.message || 'Failed to update profile';
    } finally { loading.value = false; }
  }

  return {
    myProfile, adminProfiles, clientProfiles, loading, error,
    loadMyProfile, loadAllAdmins, loadAllClients,
    createAdmin, createClient, updateMyProfile,
  };
});
