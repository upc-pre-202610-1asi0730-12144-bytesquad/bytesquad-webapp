<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/auth/application/auth.store.js';

const auth    = useAuthStore();
const router  = useRouter();

const initials = computed(() => {
  const name = auth.user?.name ?? '';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
});
</script>

<template>
  <button class="user-profile" @click="router.push('/profile')">
    <div class="avatar">{{ initials }}</div>
    <span class="user-name">{{ auth.user?.name }}</span>
  </button>
</template>

<style scoped>
.user-profile { align-items: center; background: none; border: none; color: var(--text-primary); cursor: pointer; display: flex; gap: 0.5rem; }
.avatar { align-items: center; background: #3f51b5; border-radius: 50%; color: #fff; display: flex; font-size: 0.75rem; font-weight: 700; height: 32px; justify-content: center; width: 32px; }
.user-name { font-size: 0.875rem; }
@media (max-width: 640px) { .user-name { display: none; } }
</style>
