<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore }     from '@/authentication/application/auth.store.js';
import { useProfilesStore } from '@/profiles/application/profiles.store.js';
import { useActiveGymStore } from '@/profiles/application/active-gym.store.js';
import { useGymStore } from '@/gym/application/gym.store.js';

const { t, locale } = useI18n();
const router         = useRouter();
const auth           = useAuthStore();
const profilesStore  = useProfilesStore();
const activeGymStore = useActiveGymStore();
const gymStore       = useGymStore();

const isAdmin = computed(() => auth.isAdmin);

const notifAvailability = ref(true);
const notifMaintenance  = ref(false);
const notifRewards      = ref(true);

const ADMIN_STATS = [
  { icon: 'location_on',    key: 'locations', value: 3 },
  { icon: 'fitness_center', key: 'equipment', value: 24 },
  { icon: 'sensors',        key: 'sensors',   value: 18 },
  { icon: 'group',          key: 'members',   value: 312 },
];

const editMode = ref(false);
const editForm = ref({ firstName: '', lastName: '', phoneNumber: '' });

function openEdit() {
  const p = profilesStore.myProfile;
  editForm.value = {
    firstName:   p?.firstName ?? '',
    lastName:    p?.lastName ?? '',
    phoneNumber: p?.phoneNumber ?? '',
  };
  editMode.value = true;
}

function gymName(gymId) {
  return gymStore.gyms.find(g => g.id === gymId)?.name ?? `#${gymId}`;
}

async function switchGym(gymId) {
  await activeGymStore.changeActiveGym(gymId);
}

async function submitEdit() {
  if (!editForm.value.firstName || !editForm.value.lastName) return;
  await profilesStore.updateMyProfile(editForm.value);
  editMode.value = false;
}

function initials(name) {
  return (name ?? '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
}

function setLocale(code) {
  locale.value = code;
  localStorage.setItem('spottrack_lang', code);
}

function logout() {
  auth.logout();
  router.push('/login');
}

onMounted(() => {
  profilesStore.loadMyProfile();
  if (!auth.isAdmin) {
    activeGymStore.loadAssociations();
    gymStore.loadGyms();
  }
});
</script>

<template>
  <div class="page profile-page">

    <!-- ── ADMIN PROFILE ─────────────────────────────────────── -->
    <template v-if="isAdmin">
      <div class="page__header">
        <h1 class="page__title">{{ t('profile.admin.title') }}</h1>
        <span class="role-badge role-badge--admin">{{ t('profile.admin.roleBadge') }}</span>
      </div>

      <!-- Stats grid -->
      <div class="stat-grid">
        <div v-for="s in ADMIN_STATS" :key="s.key" class="card stat-card">
          <div class="stat-icon-wrap">
            <span class="material-icons stat-icon">{{ s.icon }}</span>
          </div>
          <div>
            <p class="stat-value">{{ s.value }}</p>
            <p class="stat-label">{{ t(`profile.admin.stats.${s.key}`) }}</p>
          </div>
        </div>
      </div>

      <!-- Plan card -->
      <div class="card plan-card">
        <div class="plan-header">
          <div>
            <p class="plan-name">SpotTrack Pro</p>
            <span class="plan-active">{{ t('profile.admin.plan.active') }}</span>
          </div>
          <p class="plan-renewal">{{ t('profile.admin.plan.renewal') }}: <strong>Jun 1, 2026</strong></p>
        </div>
      </div>

      <!-- Account info -->
      <div class="card section">
        <h2 class="section-title">{{ t('profile.account.title') }}</h2>
        <div class="account-grid">
          <div class="account-field">
            <label>{{ t('profile.account.email') }}</label>
            <p>{{ profilesStore.myProfile?.email ?? '—' }}</p>
          </div>
          <div class="account-field">
            <label>{{ t('profile.account.gymName') }}</label>
            <p>SpotTrack Fitness</p>
          </div>
          <div class="account-field">
            <label>{{ t('profile.account.phone') }}</label>
            <p>{{ profilesStore.myProfile?.phoneNumber ?? '—' }}</p>
          </div>
        </div>

        <!-- Edit form -->
        <template v-if="editMode">
          <form class="edit-form" @submit.prevent="submitEdit">
            <div class="edit-grid">
              <div class="form-field">
                <label>First name</label>
                <input v-model="editForm.firstName" placeholder="First name" required />
              </div>
              <div class="form-field">
                <label>Last name</label>
                <input v-model="editForm.lastName" placeholder="Last name" required />
              </div>
              <div class="form-field">
                <label>Phone</label>
                <input v-model="editForm.phoneNumber" placeholder="+51 999 000 000" />
              </div>
            </div>
            <div class="edit-actions">
              <button type="submit" class="btn btn--primary" :disabled="profilesStore.loading">Save</button>
              <button type="button" class="btn btn--outline" @click="editMode = false">Cancel</button>
            </div>
          </form>
        </template>
        <button v-else class="btn btn--outline edit-btn" @click="openEdit">
          <span class="material-icons" style="font-size:15px">edit</span> Edit profile
        </button>
      </div>
    </template>

    <!-- ── CLIENT PROFILE ─────────────────────────────────────── -->
    <template v-else>
      <div class="page__header">
        <h1 class="page__title">{{ t('profile.client.title') }}</h1>
        <span class="role-badge role-badge--client">{{ t('profile.client.roleBadge') }}</span>
      </div>

      <!-- Avatar -->
      <div class="card avatar-card">
        <div class="avatar-circle">{{ initials(profilesStore.myProfile?.fullName) }}</div>
        <div class="avatar-info">
          <p class="avatar-name">{{ profilesStore.myProfile?.fullName ?? '—' }}</p>
          <p class="avatar-email">{{ profilesStore.myProfile?.email ?? '—' }}</p>
        </div>
      </div>

      <!-- Gym switcher -->
      <div class="card section">
        <div class="card-header">
          <span class="material-icons card-header__icon">storefront</span>
          <h2 class="section-title">{{ t('profile.gymSwitcher.title') }}</h2>
        </div>
        <p v-if="!activeGymStore.associations.length" class="section-hint">{{ t('profile.gymSwitcher.empty') }}</p>
        <ul v-else class="gym-list">
          <li v-for="assoc in activeGymStore.associations" :key="assoc.gymId" class="gym-item">
            <span class="material-icons" style="font-size:18px;color:var(--accent)">storefront</span>
            <span class="gym-item__name">{{ gymName(assoc.gymId) }}</span>
            <span v-if="assoc.active" class="badge badge--green">{{ t('profile.gymSwitcher.active') }}</span>
            <button v-else class="btn btn--outline btn--sm" :disabled="activeGymStore.loading" @click="switchGym(assoc.gymId)">
              {{ t('profile.gymSwitcher.switch') }}
            </button>
          </li>
        </ul>
        <router-link to="/gym/associate" class="join-link">{{ t('profile.gymSwitcher.joinAnother') }}</router-link>
      </div>

      <!-- Edit form -->
      <div class="card section">
        <div class="card-header">
          <span class="material-icons card-header__icon">manage_accounts</span>
          <h2 class="section-title">{{ t('profile.account.title') }}</h2>
        </div>
        <div class="account-grid">
          <div class="account-field">
            <label>{{ t('profile.account.email') }}</label>
            <p>{{ profilesStore.myProfile?.email ?? '—' }}</p>
          </div>
          <div class="account-field">
            <label>{{ t('profile.account.phone') }}</label>
            <p>{{ profilesStore.myProfile?.phoneNumber ?? '—' }}</p>
          </div>
          <div class="account-field">
            <label>{{ t('profile.account.dni') }}</label>
            <p>{{ profilesStore.myProfile?.dni ?? '—' }}</p>
          </div>
        </div>
        <template v-if="editMode">
          <form class="edit-form" @submit.prevent="submitEdit">
            <div class="edit-grid">
              <div class="form-field">
                <label>First name</label>
                <input v-model="editForm.firstName" placeholder="First name" required />
              </div>
              <div class="form-field">
                <label>Last name</label>
                <input v-model="editForm.lastName" placeholder="Last name" required />
              </div>
              <div class="form-field">
                <label>Phone</label>
                <input v-model="editForm.phoneNumber" placeholder="+51 999 000 000" />
              </div>
            </div>
            <div class="edit-actions">
              <button type="submit" class="btn btn--primary" :disabled="profilesStore.loading">Save</button>
              <button type="button" class="btn btn--outline" @click="editMode = false">Cancel</button>
            </div>
          </form>
        </template>
        <button v-else class="btn btn--outline edit-btn" @click="openEdit">
          <span class="material-icons" style="font-size:15px">edit</span> Edit profile
        </button>
      </div>

      <!-- Notifications -->
      <div class="card section">
        <div class="card-header">
          <span class="material-icons card-header__icon">notifications</span>
          <h2 class="section-title">{{ t('profile.client.notifications.title') }}</h2>
        </div>
        <div class="notif-list">
          <div class="notif-row">
            <div class="notif-info">
              <p class="notif-title">{{ t('profile.client.notifications.availability.title') }}</p>
              <p class="notif-desc">{{ t('profile.client.notifications.availability.desc') }}</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="notifAvailability" />
              <span class="toggle-track"></span>
            </label>
          </div>
          <div class="notif-row">
            <div class="notif-info">
              <p class="notif-title">{{ t('profile.client.notifications.maintenance.title') }}</p>
              <p class="notif-desc">{{ t('profile.client.notifications.maintenance.desc') }}</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="notifMaintenance" />
              <span class="toggle-track"></span>
            </label>
          </div>
          <div class="notif-row">
            <div class="notif-info">
              <p class="notif-title">{{ t('profile.client.notifications.rewards.title') }}</p>
              <p class="notif-desc">{{ t('profile.client.notifications.rewards.desc') }}</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="notifRewards" />
              <span class="toggle-track"></span>
            </label>
          </div>
        </div>
      </div>
    </template>

    <!-- ── SHARED SECTIONS ─────────────────────────────────────── -->

    <!-- Language -->
    <div class="card section">
      <div class="card-header">
        <span class="material-icons card-header__icon">language</span>
        <h2 class="section-title">{{ t('profile.language.title') }}</h2>
      </div>
      <label class="section-sub">{{ t('profile.language.label') }}</label>
      <div class="lang-options">
        <button class="btn lang-btn" :class="locale === 'es' ? 'btn--accent' : 'btn--outline'" @click="setLocale('es')">Español</button>
        <button class="btn lang-btn" :class="locale === 'en' ? 'btn--accent' : 'btn--outline'" @click="setLocale('en')">English</button>
      </div>
      <p class="section-hint">{{ t('profile.language.hint') }}</p>
    </div>

    <!-- Security -->
    <div class="card section">
      <div class="card-header">
        <span class="material-icons card-header__icon">shield</span>
        <h2 class="section-title">{{ t('profile.security.title') }}</h2>
      </div>
      <div class="security-actions">
        <button class="btn btn--outline security-btn">
          <span class="material-icons" style="font-size:16px">lock</span>
          {{ t('profile.security.changePassword') }}
        </button>
        <button class="btn btn--danger security-btn" @click="logout">
          <span class="material-icons" style="font-size:16px">logout</span>
          {{ t('profile.security.logout') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page { margin: 0 auto; max-width: 800px; }
.card-header { align-items: center; display: flex; gap: .6rem; margin-bottom: .9rem; }
.card-header__icon { color: var(--accent); font-size: 20px; }
.card-header .section-title { margin-bottom: 0; }
.page__header { align-items: center; display: flex; gap: .75rem; margin-bottom: 1.25rem; }
.gym-list { display: flex; flex-direction: column; gap: .5rem; margin-bottom: .5rem; }
.gym-item { align-items: center; background: var(--bg-surface); border-radius: 8px; display: flex; gap: .6rem; padding: .5rem .75rem; }
.gym-item__name { flex: 1; font-size: .85rem; }
.btn--sm { font-size: .75rem; padding: .25rem .6rem; }
.join-link { color: var(--accent); font-size: .8rem; text-decoration: none; }
.role-badge { border-radius: 12px; font-size: .75rem; font-weight: 700; padding: .25rem .75rem; }
.role-badge--admin  { background: rgba(245,188,54,.2); color: var(--accent); }
.role-badge--client { background: rgba(0,204,178,.15); color: var(--teal); }
.stat-grid { display: grid; gap: .75rem; grid-template-columns: repeat(2, 1fr); margin-bottom: 1rem; }
.stat-card { align-items: center; display: flex; gap: .75rem; }
.stat-icon-wrap { align-items: center; background: rgba(245,188,54,.12); border-radius: 10px; display: flex; height: 44px; justify-content: center; width: 44px; }
.stat-icon { color: var(--accent); font-size: 22px; }
.stat-value { font-size: 1.4rem; font-weight: 700; }
.stat-label { color: var(--text-secondary); font-size: .75rem; }
.plan-card { margin-bottom: 1rem; }
.plan-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: .75rem; }
.plan-name { font-size: .95rem; font-weight: 700; }
.plan-active { background: rgba(34,197,94,.15); border-radius: 10px; color: var(--green); font-size: .72rem; font-weight: 600; padding: .15rem .5rem; }
.plan-renewal { color: var(--text-secondary); font-size: .78rem; margin-top: .75rem; }
.btn--accent { background: var(--accent); border: none; color: #000; font-weight: 600; }
.btn--danger { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); color: var(--red); }
.avatar-card { align-items: center; display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
.avatar-circle { align-items: center; background: var(--accent); border-radius: 50%; color: #000; display: flex; font-size: 1.1rem; font-weight: 700; height: 56px; justify-content: center; width: 56px; }
.avatar-info { flex: 1; }
.avatar-name  { font-size: .95rem; font-weight: 600; }
.avatar-email { color: var(--text-secondary); font-size: .8rem; }
.section { margin-bottom: 1rem; }
.section-title { font-size: .9rem; font-weight: 600; margin-bottom: .5rem; }
.section-sub  { color: var(--text-secondary); font-size: .8rem; margin-bottom: .5rem; display: block; }
.section-hint { color: var(--text-secondary); font-size: .75rem; margin-top: .5rem; }
.account-grid { display: grid; gap: .75rem; grid-template-columns: repeat(3, 1fr); }
.account-field label { color: var(--text-secondary); font-size: .78rem; margin-bottom: .2rem; display: block; }
.account-field p { font-size: .85rem; }
.edit-btn { font-size: .8rem; margin-top: .75rem; }
.edit-form { margin-top: .75rem; }
.edit-grid { display: grid; gap: .75rem; grid-template-columns: 1fr 1fr 1fr; margin-bottom: .75rem; }
.form-field { display: flex; flex-direction: column; gap: .3rem; }
.form-field label { color: var(--text-secondary); font-size: .78rem; }
.edit-actions { display: flex; gap: .5rem; }
.notif-list { display: flex; flex-direction: column; gap: .75rem; }
.notif-row { align-items: center; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; padding-bottom: .75rem; }
.notif-info { display: flex; flex-direction: column; gap: .1rem; }
.notif-title { font-size: .85rem; font-weight: 500; }
.notif-desc  { color: var(--text-secondary); font-size: .78rem; }
.toggle { cursor: pointer; display: inline-flex; align-items: center; }
.toggle input { display: none; }
.toggle-track { background: var(--border); border-radius: 12px; height: 22px; position: relative; transition: background .2s; width: 44px; }
.toggle input:checked + .toggle-track { background: var(--accent); }
.toggle-track::after { background: #fff; border-radius: 50%; content: ''; height: 16px; left: 3px; position: absolute; top: 3px; transition: transform .2s; width: 16px; }
.toggle input:checked + .toggle-track::after { transform: translateX(22px); }
.lang-options { display: flex; gap: .5rem; margin-top: .5rem; }
.lang-btn { font-size: .85rem; padding: .35rem .9rem; }
.security-actions { display: flex; flex-direction: column; gap: .6rem; margin-top: .25rem; }
.security-btn { align-items: center; display: flex; gap: .4rem; justify-content: flex-start; width: 100%; }
@media (max-width: 600px) { .stat-grid, .account-grid, .edit-grid { grid-template-columns: 1fr 1fr; } }
</style>
