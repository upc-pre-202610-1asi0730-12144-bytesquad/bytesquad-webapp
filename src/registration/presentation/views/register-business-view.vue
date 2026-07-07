<script setup>
import { ref } from 'vue';
import { useRegistrationStore } from '@/registration/application/registration.store.js';
import { MembershipPlan } from '@/membership/domain/model/membership.entity.js';

const store = useRegistrationStore();
const showPass = ref(false);

const form = ref({
  email: '', password: '',
  firstName: '', lastName: '', phoneNumber: '', dni: '',
  companyName: '', ruc: '', legalStructure: 'SRL', companyPhone: '', companyEmail: '',
  streetAddress: '', city: '', district: '',
  membershipTier: MembershipPlan.Basic,
});

const LEGAL_STRUCTURES = ['SRL', 'SA', 'EIRL', 'SAC'];

async function onSubmit() {
  await store.registerBusiness({ ...form.value });
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="brand">
        <span class="material-icons brand__icon">monitor_heart</span>
        <span class="brand__name">SpotTrack</span>
      </div>
      <h1 class="page-title">Register your business</h1>
      <p class="page-subtitle">Create your admin account and choose a membership plan</p>
    </div>

    <form class="form" @submit.prevent="onSubmit">
      <div v-if="store.error" class="error-banner">
        <span class="material-icons">error_outline</span>
        <span>{{ store.error }}</span>
      </div>

      <div class="card section">
        <h2 class="section__title">Account credentials</h2>
        <div class="field-row">
          <div class="form-field"><label>Email</label><input type="email" v-model="form.email" required /></div>
          <div class="form-field">
            <label>Password</label>
            <div class="password-wrap">
              <input :type="showPass ? 'text' : 'password'" v-model="form.password" required minlength="6" />
              <button type="button" class="eye-btn" @click="showPass = !showPass">
                <span class="material-icons">{{ showPass ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card section">
        <h2 class="section__title">Personal information</h2>
        <div class="field-row">
          <div class="form-field"><label>First name</label><input v-model="form.firstName" required /></div>
          <div class="form-field"><label>Last name</label><input v-model="form.lastName" required /></div>
          <div class="form-field"><label>Phone number</label><input type="tel" v-model="form.phoneNumber" required /></div>
          <div class="form-field"><label>DNI</label><input v-model="form.dni" required maxlength="8" /></div>
        </div>
      </div>

      <div class="card section">
        <h2 class="section__title">Company information</h2>
        <div class="field-row">
          <div class="form-field"><label>Company name</label><input v-model="form.companyName" required /></div>
          <div class="form-field"><label>RUC</label><input v-model="form.ruc" required maxlength="11" /></div>
          <div class="form-field">
            <label>Legal structure</label>
            <select v-model="form.legalStructure">
              <option v-for="s in LEGAL_STRUCTURES" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="form-field"><label>Company phone</label><input type="tel" v-model="form.companyPhone" required /></div>
          <div class="form-field"><label>Company email</label><input type="email" v-model="form.companyEmail" required /></div>
        </div>
      </div>

      <div class="card section">
        <h2 class="section__title">Location &amp; membership</h2>
        <div class="field-row">
          <div class="form-field"><label>Street address</label><input v-model="form.streetAddress" required /></div>
          <div class="form-field"><label>City</label><input v-model="form.city" required /></div>
          <div class="form-field"><label>District</label><input v-model="form.district" required /></div>
          <div class="form-field">
            <label>Membership plan</label>
            <select v-model="form.membershipTier">
              <option v-for="t in Object.values(MembershipPlan)" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <router-link class="btn btn--outline" to="/login">Back to login</router-link>
        <button type="submit" class="btn btn--primary" :disabled="store.loading">
          {{ store.loading ? 'Processing...' : 'Continue to payment' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--bg-base); padding: 2rem 1rem; display: flex; flex-direction: column; align-items: center; }
.page-header { text-align: center; margin-bottom: 2rem; }
.brand { display: flex; align-items: center; justify-content: center; gap: .5rem; margin-bottom: 1rem; }
.brand__icon { font-size: 2rem; color: var(--accent); }
.brand__name { font-size: 1.5rem; font-weight: 700; }
.page-title { font-size: 1.25rem; font-weight: 600; margin-bottom: .25rem; }
.page-subtitle { color: var(--text-secondary); font-size: .875rem; }
.form { width: 100%; max-width: 680px; display: flex; flex-direction: column; gap: 1rem; }
.section { padding: 1.25rem 1.5rem; }
.section__title { font-size: .8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .05em; margin: 0 0 1rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.form-field { display: flex; flex-direction: column; gap: .375rem; }
.form-field label { font-size: .8rem; font-weight: 500; color: var(--text-secondary); }
.password-wrap { position: relative; }
.password-wrap input { width: 100%; padding-right: 2.5rem; }
.eye-btn { position: absolute; right: .5rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.error-banner { display: flex; align-items: center; gap: .5rem; background: rgba(239,68,68,.1); border: 1px solid #ef4444; border-radius: var(--radius); color: #ef4444; font-size: .875rem; padding: .75rem; }
.form-actions { display: flex; justify-content: flex-end; gap: .75rem; padding-top: .5rem; }
.btn { border-radius: var(--radius); cursor: pointer; font-size: .9rem; font-weight: 600; padding: .65rem 1.25rem; transition: opacity .2s; text-decoration: none; display: inline-flex; align-items: center; }
.btn--primary { background: var(--accent); border: none; color: #000; }
.btn--primary:disabled { opacity: .5; cursor: not-allowed; }
.btn--outline { background: none; border: 1px solid var(--border); color: var(--text-primary); }
.btn--primary:not(:disabled):hover, .btn--outline:hover { opacity: .85; }
@media (max-width: 600px) { .field-row { grid-template-columns: 1fr; } }
</style>
