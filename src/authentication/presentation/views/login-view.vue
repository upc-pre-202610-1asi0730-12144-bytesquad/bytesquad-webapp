<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/authentication/application/auth.store.js';

const { t, locale } = useI18n();
const auth   = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const showPass = ref(false);

watch(() => auth.isAuthenticated, (v) => {
  if (v) router.push(auth.isAdmin ? '/dashboard' : '/client');
}, { immediate: true });

async function onSubmit()  { await auth.signIn(username.value, password.value); }
function clearError(){ auth.clearError(); }
function fillAdmin() { username.value = 'admin@spottrack.com'; password.value = 'demo1234'; auth.clearError(); }
function fillClient(){ username.value = 'cliente@email.com';   password.value = 'demo1234'; auth.clearError(); }
function setLang(l)  { locale.value = l; localStorage.setItem('spottrack_lang', l); }
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-brand">
          <span class="material-icons login-brand__icon">monitor_heart</span>
          <span class="login-brand__name">SpotTrack</span>
        </div>
        <h1 class="login-title">{{ t('auth.login.title') }}</h1>
        <p class="login-subtitle">{{ t('auth.login.subtitle') }}</p>
      </div>

      <div class="login-body">
        <div class="form-field">
          <label class="form-field__label">{{ t('auth.login.emailLabel') }}</label>
          <input type="text" v-model="username" @input="clearError" :placeholder="t('auth.login.emailPlaceholder')" autocomplete="username" />
        </div>

        <div class="form-field">
          <label class="form-field__label">{{ t('auth.login.passwordLabel') }}</label>
          <div class="form-field__password-wrap">
            <input :type="showPass ? 'text' : 'password'" v-model="password" @input="clearError" :placeholder="t('auth.login.passwordPlaceholder')" autocomplete="current-password" />
            <button class="form-field__eye" type="button" @click="showPass = !showPass">
              <span class="material-icons">{{ showPass ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>

        <div v-if="auth.error" class="error-banner">
          <span class="material-icons">error_outline</span>
          <span>{{ t(auth.error) }}</span>
        </div>

        <button class="btn-submit" type="button" @click="onSubmit">{{ t('auth.login.submitBtn') }}</button>

        <p class="register-hint">
          {{ t('auth.login.noAccount') }}
          <a class="register-hint__link" href="#">{{ t('auth.login.register') }}</a>
        </p>

        <div class="demo-section">
          <p class="demo-section__label">{{ t('auth.login.demoTitle') }}</p>
          <button class="demo-card" type="button" @click="fillAdmin">
            <span class="demo-card__email">Admin: admin@spottrack.com</span><!-- demo username -->
            <span class="demo-card__pass">{{ t('auth.login.demoPassword') }}</span>
          </button>
          <button class="demo-card" type="button" @click="fillClient">
            <span class="demo-card__email">Cliente: cliente@email.com</span>
            <span class="demo-card__pass">{{ t('auth.login.demoPassword') }}</span>
          </button>
        </div>

        <div class="lang-row">
          <button class="lang-btn" :class="{ active: locale === 'es' }" @click="setLang('es')">ES</button>
          <button class="lang-btn" :class="{ active: locale === 'en' }" @click="setLang('en')">EN</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-base); padding: 1rem; }
.login-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; width: 100%; max-width: 420px; overflow: hidden; }
.login-header { padding: 2rem 2rem 1rem; text-align: center; }
.login-brand { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
.login-brand__icon { font-size: 2rem; color: var(--accent); }
.login-brand__name { font-size: 1.5rem; font-weight: 700; }
.login-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.25rem; }
.login-subtitle { color: var(--text-secondary); font-size: 0.875rem; }
.login-body { padding: 1.5rem 2rem 2rem; display: flex; flex-direction: column; gap: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 0.375rem; }
.form-field__label { font-size: 0.8rem; font-weight: 500; color: var(--text-secondary); }
.form-field input { width: 100%; }
.form-field__password-wrap { position: relative; }
.form-field__password-wrap input { width: 100%; padding-right: 2.5rem; }
.form-field__eye { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.error-banner { display: flex; align-items: center; gap: 0.5rem; background: rgba(239,68,68,.1); border: 1px solid #ef4444; border-radius: var(--radius); color: #ef4444; font-size: 0.875rem; padding: 0.75rem; }
.btn-submit { width: 100%; background: var(--accent); border: none; border-radius: var(--radius); color: #000; font-size: 0.9rem; font-weight: 600; padding: 0.75rem; cursor: pointer; transition: opacity .2s; }
.btn-submit:hover { opacity: 0.85; }
.register-hint { font-size: 0.8rem; color: var(--text-secondary); text-align: center; }
.register-hint__link { color: var(--accent); cursor: pointer; }
.demo-section { display: flex; flex-direction: column; gap: 0.5rem; }
.demo-section__label { font-size: 0.75rem; color: var(--text-secondary); text-align: center; }
.demo-card { display: flex; flex-direction: column; align-items: flex-start; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.625rem 0.875rem; cursor: pointer; transition: border-color .2s; }
.demo-card:hover { border-color: var(--accent); }
.demo-card__email { font-size: 0.8rem; font-weight: 500; }
.demo-card__pass { font-size: 0.75rem; color: var(--text-secondary); }
.lang-row { display: flex; justify-content: center; gap: 0.5rem; }
.lang-btn { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; color: var(--text-secondary); cursor: pointer; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; }
.lang-btn.active { border-color: var(--accent); color: var(--accent); }
</style>
