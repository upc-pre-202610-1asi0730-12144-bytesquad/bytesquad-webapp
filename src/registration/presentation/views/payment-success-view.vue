<script setup>
// TODO: if backend ever exposes GET /register-business/{id}/status, call it here to verify
// Static confirmation is the correct design — confirmed with backend team (no verification endpoint exists)
</script>

<template>
  <div class="page">
    <div class="card panel">
      <span class="material-icons icon icon--success">check_circle</span>
      <h1 class="title">Payment successful</h1>
      <p class="message">Your account is being set up. You'll receive a confirmation email shortly.</p>
      <router-link class="btn" to="/login">Go to login</router-link>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--bg-base); display: flex; align-items: center; justify-content: center; padding: 1rem; }
.panel { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem 2.5rem; max-width: 420px; width: 100%; text-align: center; }
.icon { font-size: 3.5rem; }
.icon--success { color: var(--green); }
.title { font-size: 1.25rem; font-weight: 600; margin: 0; }
.message { color: var(--text-secondary); font-size: .9rem; line-height: 1.5; margin: 0; }
.btn { background: var(--accent); border: none; border-radius: var(--radius); color: #000; font-size: .9rem; font-weight: 600; padding: .65rem 1.5rem; text-decoration: none; transition: opacity .2s; }
.btn:hover { opacity: .85; }
</style>
