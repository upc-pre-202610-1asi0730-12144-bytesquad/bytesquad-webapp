<template>
  <div class="page">
    <div class="card panel">
      <span class="material-icons icon icon--cancel">cancel</span>
      <h1 class="title">Payment cancelled</h1>
      <p class="message">Your payment was not completed. No charges were made.</p>
      <div class="actions">
        <router-link class="btn btn--primary" to="/register-business">Try again</router-link>
        <router-link class="btn btn--outline" to="/login">Back to login</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--bg-base); display: flex; align-items: center; justify-content: center; padding: 1rem; }
.panel { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem 2.5rem; max-width: 420px; width: 100%; text-align: center; }
.icon { font-size: 3.5rem; }
.icon--cancel { color: var(--red); }
.title { font-size: 1.25rem; font-weight: 600; margin: 0; }
.message { color: var(--text-secondary); font-size: .9rem; line-height: 1.5; margin: 0; }
.actions { display: flex; gap: .75rem; flex-wrap: wrap; justify-content: center; }
.btn { border-radius: var(--radius); font-size: .9rem; font-weight: 600; padding: .65rem 1.25rem; text-decoration: none; transition: opacity .2s; display: inline-flex; align-items: center; }
.btn--primary { background: var(--accent); border: none; color: #000; }
.btn--outline { background: none; border: 1px solid var(--border); color: var(--text-primary); }
.btn:hover { opacity: .85; }
</style>
