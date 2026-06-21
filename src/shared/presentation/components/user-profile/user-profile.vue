<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore }     from '@/auth/application/auth.store.js';
import { useProfilesStore } from '@/profiles/application/profiles.store.js';

const auth           = useAuthStore();
const profilesStore  = useProfilesStore();
const router         = useRouter();

const displayName = computed(() => profilesStore.myProfile?.fullName ?? auth.user?.name ?? '');

const initials = computed(() => {
  return displayName.value.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
});

onMounted(() => profilesStore.loadMyProfile());
</script>

<template>
  <button class="user-profile" @click="router.push('/profile')">
    <div class="avatar">{{ initials }}</div>
    <span class="user-name">{{ displayName }}</span>
  </button>
</template>

<style scoped>
.user-profile { align-items: center; background: none; border: none; color: var(--text-primary); cursor: pointer; display: flex; gap: 0.5rem; }
.avatar { align-items: center; background: #3f51b5; border-radius: 50%; color: #fff; display: flex; font-size: 0.75rem; font-weight: 700; height: 32px; justify-content: center; width: 32px; }
.user-name { font-size: 0.875rem; }
@media (max-width: 640px) { .user-name { display: none; } }
</style>
