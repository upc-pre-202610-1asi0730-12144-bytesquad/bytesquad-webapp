<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useRegistrationStore } from '@/registration/application/registration.store.js';
import { useAuthStore } from '@/authentication/application/auth.store.js';
import { MembershipPlan } from '@/membership/domain/model/membership.entity.js';

const { locale } = useI18n();
const router           = useRouter();
const registrationStore = useRegistrationStore();
const authStore        = useAuthStore();

const role        = ref('client');
const step        = ref(1);
const showPass    = ref(false);
const showConfirm = ref(false);

const form = ref({
  firstName: '', lastName: '', dni: '', phoneNumber: '', email: '',
  password: '', confirmPassword: '',
  companyName: '', ruc: '', legalStructure: '', companyPhone: '', companyEmail: '',
  streetAddress: '', city: '', district: '',
});

const LEGAL_STRUCTURES = ['SRL', 'SA', 'EIRL', 'SAC'];

const PLANS = [
  {
    id: MembershipPlan.Basic,
    price: '$69',
    features: ['Hasta 20 máquinas monitoreadas', 'Mapa de calor en tiempo real', '1 sede', 'Soporte por email'],
    popular: false,
    spark: { line: 'M0,70 Q60,62 120,45 Q160,35 200,22', end: [200, 22], start: [0, 70] },
  },
  {
    id: MembershipPlan.Mid,
    price: '$109',
    features: ['Hasta 50 máquinas monitoreadas', 'Mantenimiento predictivo', 'Hasta 3 sedes', 'Dashboard analítico completo', 'Soporte prioritario 24/7'],
    popular: true,
    spark: { line: 'M0,75 Q40,65 100,40 Q160,22 200,12', end: [200, 12], start: [0, 75] },
  },
  {
    id: MembershipPlan.Premium,
    price: '$189',
    features: ['Máquinas ilimitadas', 'Análisis predictivo de ROI', 'Sedes ilimitadas', 'API personalizada', 'Gestor de cuenta dedicado'],
    popular: false,
    spark: { line: 'M0,72 Q50,58 110,34 Q165,16 200,8', end: [200, 8], start: [0, 72] },
  },
];

const passwordError = computed(() => {
  if (!form.value.password) return null;
  return form.value.password.length < 8 ? 'Password must be at least 8 characters' : null;
});

const confirmError = computed(() => {
  if (!form.value.confirmPassword) return null;
  return form.value.password !== form.value.confirmPassword ? 'Passwords do not match' : null;
});

const formError = computed(() =>
  role.value === 'client' ? authStore.error : registrationStore.error
);

function selectRole(r) {
  role.value = r;
  authStore.clearError();
  registrationStore.clearError();
}

function onContinue() {
  if (passwordError.value || confirmError.value) return;
  if (role.value === 'business') {
    step.value = 2;
  } else {
    submitClient();
  }
}

async function submitClient() {
  // Personal info fields are collected for UX consistency but not sent to the backend —
  // sign-up only accepts { username, password }. Profile fields (firstName, etc.) would
  // require a separate PUT /profiles/clients call. See TODO.md.
  await authStore.signUp(form.value.email, form.value.password);
  if (!authStore.error) router.push('/login');
}

async function selectPlan(planId) {
  await registrationStore.registerBusiness({
    email:          form.value.email,
    password:       form.value.password,
    firstName:      form.value.firstName,
    lastName:       form.value.lastName,
    phoneNumber:    form.value.phoneNumber,
    dni:            form.value.dni,
    companyName:    form.value.companyName,
    ruc:            form.value.ruc,
    legalStructure: form.value.legalStructure,
    companyPhone:   form.value.companyPhone,
    companyEmail:   form.value.companyEmail,
    streetAddress:  form.value.streetAddress,
    city:           form.value.city,
    district:       form.value.district,
    membershipTier: planId,
  });
}

function setLang(l) { locale.value = l; localStorage.setItem('spottrack_lang', l); }
</script>

<template>
  <!-- ── STEP 1: Registration form ─────────────────────────────────────────── -->
  <div v-if="step === 1" class="page">
    <div class="card register-card">

      <div class="reg-header">
        <div class="brand">
          <span class="material-icons brand__icon">monitor_heart</span>
          <span class="brand__name">SpotTrack</span>
        </div>
        <h1 class="reg-title">Create Account</h1>
        <p class="reg-subtitle">Join SpotTrack to start tracking your gym</p>
      </div>

      <div class="divider" />

      <form @submit.prevent="onContinue" class="reg-body">

        <!-- Role selector -->
        <p class="section-label">I want to register as</p>
        <div class="role-grid">
          <button type="button" class="role-card" :class="{ 'role-card--active': role === 'client' }" @click="selectRole('client')">
            <span class="material-icons role-card__icon">person</span>
            <span class="role-card__name">Client</span>
            <span class="role-card__desc">Book equipment and track my workouts</span>
          </button>
          <button type="button" class="role-card" :class="{ 'role-card--active': role === 'business' }" @click="selectRole('business')">
            <span class="material-icons role-card__icon">storefront</span>
            <span class="role-card__name">Business</span>
            <span class="role-card__desc">Manage a gym and subscribe to a plan</span>
          </button>
        </div>

        <!-- Personal info -->
        <div class="field-row">
          <div class="form-field">
            <label>First name</label>
            <input v-model="form.firstName" placeholder="John" required />
          </div>
          <div class="form-field">
            <label>Last name</label>
            <input v-model="form.lastName" placeholder="Doe" required />
          </div>
        </div>
        <div class="field-row">
          <div class="form-field">
            <label>DNI / National ID</label>
            <input v-model="form.dni" placeholder="12345678" required maxlength="8" />
          </div>
          <div class="form-field">
            <label>Phone number</label>
            <input type="tel" v-model="form.phoneNumber" placeholder="987654321" required />
          </div>
        </div>
        <div class="form-field">
          <label>Email</label>
          <input type="email" v-model="form.email" placeholder="your@email.com" required />
        </div>

        <!-- Business info (conditional) -->
        <div v-if="role === 'business'" class="business-section">
          <p class="business-label">BUSINESS INFORMATION</p>
          <div class="form-field">
            <label>Company name</label>
            <input v-model="form.companyName" placeholder="Acme S.A.C." required />
          </div>
          <div class="field-row">
            <div class="form-field">
              <label>RUC</label>
              <input v-model="form.ruc" placeholder="20123456789" required maxlength="11" />
            </div>
            <div class="form-field">
              <label>Legal structure</label>
              <select v-model="form.legalStructure" required>
                <option value="" disabled>Select a legal type</option>
                <option v-for="s in LEGAL_STRUCTURES" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
          <div class="field-row">
            <div class="form-field">
              <label>Company phone</label>
              <input type="tel" v-model="form.companyPhone" placeholder="014567890" required />
            </div>
            <div class="form-field">
              <label>Company email</label>
              <input type="email" v-model="form.companyEmail" placeholder="contact@company.com" required />
            </div>
          </div>
          <div class="form-field">
            <label>Street address</label>
            <input v-model="form.streetAddress" placeholder="Av. Javier Prado 123" required />
          </div>
          <div class="field-row">
            <div class="form-field">
              <label>City</label>
              <input v-model="form.city" placeholder="Lima" required />
            </div>
            <div class="form-field">
              <label>District</label>
              <input v-model="form.district" placeholder="San Isidro" required />
            </div>
          </div>
        </div>

        <!-- Password -->
        <div class="form-field">
          <label>Password</label>
          <div class="password-wrap">
            <input :type="showPass ? 'text' : 'password'" v-model="form.password"
              placeholder="At least 8 characters" required minlength="8" />
            <button type="button" class="eye-btn" @click="showPass = !showPass">
              <span class="material-icons">{{ showPass ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
        </div>
        <div class="form-field">
          <label>Confirm password</label>
          <div class="password-wrap">
            <input :type="showConfirm ? 'text' : 'password'" v-model="form.confirmPassword"
              placeholder="Repeat your password" required />
            <button type="button" class="eye-btn" @click="showConfirm = !showConfirm">
              <span class="material-icons">{{ showConfirm ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          <span v-if="confirmError" class="field-error">{{ confirmError }}</span>
        </div>

        <!-- API error -->
        <div v-if="formError" class="error-banner">
          <span class="material-icons">error_outline</span>
          <span>{{ formError }}</span>
        </div>

        <button type="submit" class="btn-submit"
          :disabled="authStore.loading || registrationStore.loading">
          {{ (authStore.loading || registrationStore.loading) ? 'Processing...' : 'Create account' }}
        </button>

        <p class="signin-hint">
          Already have an account?
          <router-link class="signin-hint__link" to="/login">Sign in</router-link>
        </p>

        <div class="lang-row">
          <button class="lang-btn" :class="{ active: locale === 'en' }" type="button" @click="setLang('en')">EN English</button>
          <button class="lang-btn" :class="{ active: locale === 'es' }" type="button" @click="setLang('es')">ES Español</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ── STEP 2: Plan picker (Business only) ───────────────────────────────── -->
  <div v-else class="plans-page">
    <button class="back-btn" type="button" @click="step = 1">
      <span class="material-icons">arrow_back</span> Back
    </button>

    <h1 class="plans-title">Planes y Precios</h1>

    <div v-if="registrationStore.error" class="plans-error">
      <span class="material-icons">error_outline</span>
      {{ registrationStore.error }}
    </div>

    <div class="plans-grid">
      <div v-for="plan in PLANS" :key="plan.id"
        class="plan-card" :class="{ 'plan-card--popular': plan.popular }">

        <div v-if="plan.popular" class="popular-badge">
          <span class="popular-badge__dot" />
          Más Popular
        </div>

        <div class="plan-card__body">
          <p class="plan-name">{{ plan.id }}</p>
          <p class="plan-price">
            <span class="plan-price__amount">{{ plan.price }}</span>
            <span class="plan-price__period">/mes</span>
          </p>

          <p class="spark-label">EQUIPMENT UPTIME</p>
          <svg class="sparkline" viewBox="0 0 200 80" preserveAspectRatio="none">
            <defs>
              <linearGradient :id="`grad-${plan.id}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path :d="`${plan.spark.line} L200,80 L0,80 Z`" :fill="`url(#grad-${plan.id})`"/>
            <path :d="plan.spark.line" fill="none" stroke="var(--accent)" stroke-width="2"/>
            <circle :cx="plan.spark.start[0]" :cy="plan.spark.start[1]" r="3" fill="var(--accent)"/>
            <circle :cx="plan.spark.end[0]"   :cy="plan.spark.end[1]"   r="3" fill="var(--accent)"/>
          </svg>

          <ul class="plan-features">
            <li v-for="f in plan.features" :key="f" class="plan-features__item">
              <span class="material-icons plan-features__check">check</span>
              {{ f }}
            </li>
          </ul>
        </div>

        <button class="plan-btn" :class="plan.popular ? 'plan-btn--filled' : 'plan-btn--outline'"
          :disabled="registrationStore.loading"
          type="button"
          @click="selectPlan(plan.id)">
          {{ registrationStore.loading ? 'Processing...' : 'Comprar Ahora' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Shared ────────────────────────────────────────────────────── */
.form-field { display: flex; flex-direction: column; gap: .375rem; }
.form-field label { font-size: .85rem; font-weight: 600; color: var(--text-primary); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.password-wrap { position: relative; }
.password-wrap input { width: 100%; padding-right: 2.5rem; }
.eye-btn { position: absolute; right: .5rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.field-error { color: var(--red); font-size: .78rem; margin-top: .15rem; }
.error-banner { display: flex; align-items: center; gap: .5rem; background: rgba(239,68,68,.1); border: 1px solid #ef4444; border-radius: var(--radius); color: #ef4444; font-size: .85rem; padding: .75rem; }

/* ── Step 1: Form ──────────────────────────────────────────────── */
.page { min-height: 100vh; background: var(--bg-base); display: flex; align-items: flex-start; justify-content: center; padding: 2rem 1rem; }
.register-card { width: 100%; max-width: 480px; overflow: hidden; }
.reg-header { padding: 1.75rem 2rem 1.25rem; text-align: center; }
.brand { display: flex; align-items: center; justify-content: center; gap: .5rem; margin-bottom: .75rem; }
.brand__icon { font-size: 1.75rem; color: var(--accent); }
.brand__name { font-size: 1.25rem; font-weight: 700; }
.reg-title { font-size: 1.5rem; font-weight: 700; margin: 0 0 .25rem; }
.reg-subtitle { color: var(--text-secondary); font-size: .875rem; margin: 0; }
.divider { height: 1px; background: var(--border); }
.reg-body { display: flex; flex-direction: column; gap: 1rem; padding: 1.5rem 2rem 2rem; }
.section-label { font-size: .875rem; font-weight: 600; margin: 0; }

/* Role cards */
.role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.role-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; display: flex; flex-direction: column; align-items: flex-start; gap: .25rem; padding: .875rem 1rem; text-align: left; transition: border-color .15s, background .15s; }
.role-card--active { background: rgba(var(--accent-rgb, 234,179,8), .08); border-color: var(--accent); }
.role-card__icon { color: var(--text-secondary); font-size: 1.5rem; }
.role-card--active .role-card__icon { color: var(--accent); }
.role-card__name { font-size: .9rem; font-weight: 700; color: var(--text-primary); }
.role-card__desc { font-size: .75rem; color: var(--text-secondary); line-height: 1.35; }

/* Business section */
.business-section { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); display: flex; flex-direction: column; gap: .75rem; padding: 1rem; }
.business-label { color: var(--accent); font-size: .75rem; font-weight: 700; letter-spacing: .08em; margin: 0; text-transform: uppercase; }

/* Submit + footer */
.btn-submit { background: var(--accent); border: none; border-radius: var(--radius); color: #000; cursor: pointer; font-size: .95rem; font-weight: 700; padding: .8rem; transition: opacity .2s; width: 100%; }
.btn-submit:disabled { opacity: .55; cursor: not-allowed; }
.btn-submit:not(:disabled):hover { opacity: .85; }
.signin-hint { color: var(--text-secondary); font-size: .82rem; text-align: center; }
.signin-hint__link { color: var(--accent); font-weight: 600; text-decoration: none; }
.lang-row { display: flex; justify-content: center; gap: .5rem; }
.lang-btn { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; color: var(--text-secondary); cursor: pointer; font-size: .75rem; font-weight: 600; padding: .3rem .75rem; }
.lang-btn.active { border-color: var(--accent); color: var(--accent); }

/* ── Step 2: Plan picker ───────────────────────────────────────── */
.plans-page { min-height: 100vh; background: var(--bg-base); display: flex; flex-direction: column; align-items: center; padding: 2rem 1.5rem 4rem; }
.back-btn { align-self: flex-start; background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: .25rem; font-size: .875rem; margin-bottom: 1rem; padding: 0; }
.back-btn:hover { color: var(--text-primary); }
.plans-title { font-size: 2rem; font-weight: 700; margin: 0 0 2.5rem; text-align: center; }
.plans-error { display: flex; align-items: center; gap: .5rem; background: rgba(239,68,68,.1); border: 1px solid #ef4444; border-radius: var(--radius); color: #ef4444; font-size: .85rem; margin-bottom: 1.5rem; padding: .75rem 1.25rem; width: 100%; max-width: 900px; }
.plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; width: 100%; max-width: 900px; }
.plan-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; position: relative; }
.plan-card--popular { border-color: var(--accent); }
.popular-badge { background: var(--accent); border-radius: 999px; color: #000; display: flex; align-items: center; gap: .4rem; font-size: .75rem; font-weight: 700; left: 50%; padding: .3rem .9rem; position: absolute; top: -16px; transform: translateX(-50%); white-space: nowrap; }
.popular-badge__dot { background: #000; border-radius: 50%; height: 6px; width: 6px; }
.plan-card__body { display: flex; flex-direction: column; flex: 1; gap: .5rem; padding: 1.75rem 1.5rem 1rem; }
.plan-name { font-size: 1.25rem; font-weight: 700; margin: 0; }
.plan-price { display: flex; align-items: baseline; gap: .2rem; margin: 0; }
.plan-price__amount { color: var(--accent); font-size: 2rem; font-weight: 700; }
.plan-price__period { color: var(--text-secondary); font-size: .85rem; }
.spark-label { color: var(--text-secondary); font-size: .65rem; font-weight: 600; letter-spacing: .08em; margin: .5rem 0 .25rem; text-transform: uppercase; }
.sparkline { display: block; height: 64px; width: 100%; }
.plan-features { display: flex; flex-direction: column; gap: .4rem; list-style: none; margin: .75rem 0 0; padding: 0; }
.plan-features__item { align-items: flex-start; color: var(--text-secondary); display: flex; font-size: .82rem; gap: .4rem; line-height: 1.4; }
.plan-features__check { color: var(--accent); font-size: .95rem; flex-shrink: 0; margin-top: .05rem; }
.plan-btn { border-radius: 0 0 12px 12px; cursor: pointer; font-size: .9rem; font-weight: 700; padding: .9rem; transition: opacity .2s; width: 100%; }
.plan-btn:disabled { cursor: not-allowed; opacity: .55; }
.plan-btn--filled { background: var(--accent); border: none; color: #000; }
.plan-btn--outline { background: transparent; border: 1px solid var(--border); border-top: none; color: var(--accent); }
.plan-btn:not(:disabled):hover { opacity: .85; }

@media (max-width: 700px) {
  .field-row { grid-template-columns: 1fr; }
  .role-grid { grid-template-columns: 1fr; }
  .plans-grid { grid-template-columns: 1fr; }
  .reg-body { padding: 1.25rem 1.25rem 1.75rem; }
}
</style>
