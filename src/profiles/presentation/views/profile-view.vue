<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore }        from '@/authentication/application/auth.store.js';
import { useProfilesStore }    from '@/profiles/application/profiles.store.js';
import { useGymStore }         from '@/gym/application/gym.store.js';
import { useEquipmentStore }   from '@/gym/application/equipment.store.js';
import { useMaintenanceStore } from '@/maintenance/application/maintenance.store.js';
import { useMembershipStore }  from '@/membership/application/membership.store.js';
import { MembershipStatus }    from '@/membership/domain/model/membership.entity.js';

const { t, locale } = useI18n();
const router         = useRouter();
const auth           = useAuthStore();
const profilesStore  = useProfilesStore();
const gymStore       = useGymStore();
const equipStore     = useEquipmentStore();
const mainStore      = useMaintenanceStore();
const memberStore    = useMembershipStore();

const isAdmin = computed(() => auth.isAdmin);

// ── Admin: edit profile ──────────────────────────────────────────────────────
const editMode    = ref(false);
const editForm    = ref({ firstName: '', lastName: '', phoneNumber: '' });
const editSuccess = ref(false);

function openEdit() {
  const p = profilesStore.myProfile;
  editForm.value = {
    firstName:   p?.firstName   ?? '',
    lastName:    p?.lastName    ?? '',
    phoneNumber: p?.phoneNumber ?? '',
  };
  editMode.value = true;
}

async function submitEdit() {
  await profilesStore.updateMyProfile(editForm.value);
  if (!profilesStore.error) {
    editMode.value    = false;
    editSuccess.value = true;
    setTimeout(() => { editSuccess.value = false; }, 3000);
  }
}

// ── Admin: change password ───────────────────────────────────────────────────
const openPassword = ref(false);
const pwForm       = ref({ current: '', next: '', confirm: '' });
const pwSuccess    = ref(false);
const pwMatchError = ref(false);

async function submitPassword() {
  auth.clearError();
  pwMatchError.value = false;
  if (pwForm.value.next !== pwForm.value.confirm) { pwMatchError.value = true; return; }
  try {
    await auth.changePassword(pwForm.value.current, pwForm.value.next);
    pwForm.value       = { current: '', next: '', confirm: '' };
    openPassword.value = false;
    pwSuccess.value    = true;
    setTimeout(() => { pwSuccess.value = false; }, 4000);
  } catch { /* auth.error set by store */ }
}

// ── Admin: membership ────────────────────────────────────────────────────────
const activeMembership = computed(() =>
  memberStore.memberships.find(m =>
    m.status === MembershipStatus.Active || m.status === MembershipStatus.PendingCancellation
  ) ?? null
);

function memberStatusClass(status) {
  if (status === MembershipStatus.Active)              return 'badge--green';
  if (status === MembershipStatus.PendingCancellation) return 'badge--amber';
  return 'badge--outline';
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Admin: stats ─────────────────────────────────────────────────────────────
const branchCount    = computed(() => gymStore.branches.length);
const equipmentCount = computed(() => equipStore.error ? '—' : equipStore.equipment.length);
const ticketCount    = computed(() => mainStore.tickets.length);

// ── Client: keep existing ────────────────────────────────────────────────────
const notifAvailability = ref(true);
const notifMaintenance  = ref(false);
const notifRewards      = ref(true);

function initials(name) {
  return (name ?? '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
}

function setLocale(code) {
  locale.value = code;
  localStorage.setItem('spottrack_lang', code);
}

onMounted(async () => {
  const id = auth.user?.id;
  if (!id) return;
  await profilesStore.loadMyProfile();
  if (auth.isAdmin) {
    const gymId = gymStore.currentGym?.id;
    await Promise.all([
      gymId ? gymStore.loadBranches(gymId) : Promise.resolve(),
      equipStore.loadEquipment(),
      mainStore.loadTickets(id),
      memberStore.loadByClient(id),
    ]);
  }
});
</script>

<template>
  <div class="page">

    <!-- ── ADMIN PROFILE ──────────────────────────────────────────────────── -->
    <template v-if="isAdmin">
      <div class="page__header">
        <h1 class="page__title">{{ t('profile.admin.title') }}</h1>
        <span class="role-badge role-badge--admin">{{ t('profile.admin.roleBadge') }}</span>
      </div>

      <!-- 1. Datos Personales -->
      <div class="card section">
        <div class="section-row">
          <div class="avatar-circle">{{ initials(profilesStore.myProfile?.fullName) }}</div>
          <div class="profile-info">
            <p class="profile-name">
              {{ profilesStore.loading ? '…' : (profilesStore.myProfile?.fullName || '—') }}
            </p>
            <p class="profile-sub">{{ profilesStore.myProfile?.email ?? '—' }}</p>
            <p class="profile-sub">{{ profilesStore.myProfile?.dni ? `DNI: ${profilesStore.myProfile.dni}` : '' }}</p>
          </div>
        </div>

        <div v-if="!editMode" class="account-grid" style="margin-top:1rem">
          <div class="account-field">
            <label>{{ t('profile.account.name') }}</label>
            <p>{{ profilesStore.myProfile?.firstName ?? '—' }} {{ profilesStore.myProfile?.lastName ?? '' }}</p>
          </div>
          <div class="account-field">
            <label>{{ t('profile.account.phone') }}</label>
            <p>{{ profilesStore.myProfile?.phoneNumber ?? '—' }}</p>
          </div>
          <div class="account-field">
            <label>{{ t('profile.account.email') }}</label>
            <p class="readonly-val">{{ profilesStore.myProfile?.email ?? '—' }}</p>
          </div>
        </div>

        <template v-if="editMode">
          <form class="edit-form" @submit.prevent="submitEdit">
            <div class="edit-grid">
              <div class="form-field">
                <label>{{ t('profile.account.firstName') }}</label>
                <input v-model="editForm.firstName" required />
              </div>
              <div class="form-field">
                <label>{{ t('profile.account.lastName') }}</label>
                <input v-model="editForm.lastName" required />
              </div>
              <div class="form-field">
                <label>{{ t('profile.account.phone') }}</label>
                <input v-model="editForm.phoneNumber" />
              </div>
            </div>
            <div v-if="profilesStore.error" class="alert alert--error">{{ profilesStore.error }}</div>
            <div class="edit-actions">
              <button type="submit" class="btn btn--primary" :disabled="profilesStore.loading">
                {{ t('profile.actions.save') }}
              </button>
              <button type="button" class="btn btn--outline" @click="editMode = false">
                {{ t('profile.actions.cancel') }}
              </button>
            </div>
          </form>
        </template>

        <div v-if="editSuccess" class="alert alert--success" style="margin-top:.75rem">
          {{ t('profile.actions.saveSuccess') }}
        </div>

        <button v-if="!editMode" class="btn btn--outline edit-btn" @click="openEdit">
          <span class="material-icons" style="font-size:15px">edit</span>
          {{ t('profile.actions.edit') }}
        </button>
      </div>

      <!-- 2. Gym -->
      <div class="card section">
        <h2 class="section-title">{{ t('profile.admin.gym.title') }}</h2>
        <div class="gym-row">
          <span class="material-icons gym-icon">fitness_center</span>
          <span class="gym-name">{{ gymStore.currentGym?.name ?? '—' }}</span>
        </div>
      </div>

      <!-- 3. Estadísticas -->
      <div class="stat-grid">
        <button class="card stat-card" @click="router.push('/gym')">
          <div class="stat-icon-wrap stat-icon-wrap--blue">
            <span class="material-icons stat-icon">location_on</span>
          </div>
          <div>
            <p class="stat-value">{{ branchCount }}</p>
            <p class="stat-label">{{ t('profile.admin.stats.branches') }}</p>
          </div>
          <span class="material-icons stat-arrow">chevron_right</span>
        </button>
        <button class="card stat-card" @click="router.push('/equipment')">
          <div class="stat-icon-wrap stat-icon-wrap--amber">
            <span class="material-icons stat-icon">fitness_center</span>
          </div>
          <div>
            <p class="stat-value">{{ equipmentCount }}</p>
            <p class="stat-label">{{ t('profile.admin.stats.equipment') }}</p>
          </div>
          <span class="material-icons stat-arrow">chevron_right</span>
        </button>
        <button class="card stat-card" @click="router.push('/maintenance')">
          <div class="stat-icon-wrap stat-icon-wrap--red">
            <span class="material-icons stat-icon">build</span>
          </div>
          <div>
            <p class="stat-value">{{ ticketCount }}</p>
            <p class="stat-label">{{ t('profile.admin.stats.tickets') }}</p>
          </div>
          <span class="material-icons stat-arrow">chevron_right</span>
        </button>
      </div>

      <!-- 4. Membership Card -->
      <div class="card section">
        <div class="section-row" style="justify-content:space-between">
          <h2 class="section-title" style="margin:0">{{ t('profile.admin.membership.title') }}</h2>
          <button class="btn btn--outline" style="font-size:.8rem" @click="router.push('/membership')">
            {{ t('profile.admin.membership.manage') }}
            <span class="material-icons" style="font-size:14px;vertical-align:middle">open_in_new</span>
          </button>
        </div>

        <div v-if="memberStore.loading" class="membership-empty">…</div>
        <div v-else-if="!activeMembership" class="membership-empty">
          {{ t('profile.admin.membership.none') }}
        </div>
        <div v-else class="membership-body">
          <div class="membership-row">
            <span class="plan-name">{{ activeMembership.plan }}</span>
            <span class="badge" :class="memberStatusClass(activeMembership.status)">
              {{ activeMembership.status }}
            </span>
          </div>
          <p class="membership-dates">
            {{ t('profile.admin.membership.expires') }}: <strong>{{ fmtDate(activeMembership.endDate) }}</strong>
          </p>
          <p v-if="activeMembership.pendingDowngradePlan" class="membership-downgrade">
            <span class="material-icons" style="font-size:14px;vertical-align:middle">schedule</span>
            {{ t('profile.admin.membership.pendingDowngrade') }}: {{ activeMembership.pendingDowngradePlan }}
          </p>
        </div>
      </div>

      <!-- 5. Cambio de contraseña -->
      <div class="card section">
        <button class="pw-header" @click="openPassword = !openPassword">
          <div class="section-row" style="gap:.6rem">
            <span class="material-icons" style="color:var(--text-secondary);font-size:20px">lock</span>
            <h2 class="section-title" style="margin:0">{{ t('profile.security.changePassword') }}</h2>
          </div>
          <span class="material-icons chevron" :class="{ 'chevron--open': openPassword }">expand_more</span>
        </button>

        <div v-if="pwSuccess" class="alert alert--success" style="margin-top:.75rem">
          {{ t('profile.security.passwordChanged') }}
        </div>

        <form v-if="openPassword" class="edit-form" @submit.prevent="submitPassword">
          <div class="edit-grid" style="grid-template-columns:1fr 1fr 1fr">
            <div class="form-field">
              <label>{{ t('profile.security.currentPassword') }}</label>
              <input v-model="pwForm.current" type="password" required autocomplete="current-password" />
            </div>
            <div class="form-field">
              <label>{{ t('profile.security.newPassword') }}</label>
              <input v-model="pwForm.next" type="password" required autocomplete="new-password" />
            </div>
            <div class="form-field">
              <label>{{ t('profile.security.confirmPassword') }}</label>
              <input v-model="pwForm.confirm" type="password" required autocomplete="new-password" />
            </div>
          </div>
          <div v-if="pwMatchError" class="alert alert--error">
            {{ t('profile.security.passwordMismatch') }}
          </div>
          <div v-if="auth.error" class="alert alert--error">{{ auth.error }}</div>
          <div class="edit-actions">
            <button type="submit" class="btn btn--primary" :disabled="auth.loading">
              {{ t('profile.security.updatePassword') }}
            </button>
            <button type="button" class="btn btn--outline" @click="openPassword = false">
              {{ t('profile.actions.cancel') }}
            </button>
          </div>
        </form>
      </div>
    </template>

    <!-- ── CLIENT PROFILE ─────────────────────────────────────────────────── -->
    <template v-else>
      <div class="page__header">
        <h1 class="page__title">{{ t('profile.client.title') }}</h1>
        <span class="role-badge role-badge--client">{{ t('profile.client.roleBadge') }}</span>
      </div>

      <!-- Avatar + points -->
      <div class="card avatar-card">
        <div class="avatar-circle">{{ initials(profilesStore.myProfile?.fullName) }}</div>
        <div class="avatar-info">
          <p class="avatar-name">{{ profilesStore.myProfile?.fullName ?? '—' }}</p>
          <p class="avatar-email">{{ profilesStore.myProfile?.email ?? '—' }}</p>
        </div>
        <div class="points-badge">
          <span class="material-icons" style="font-size:16px;color:var(--accent)">stars</span>
          <span class="points-val">1 250</span>
          <span class="points-label">{{ t('profile.client.points') }}</span>
        </div>
      </div>

      <!-- Plan card -->
      <div class="card plan-card">
        <div class="plan-header">
          <div>
            <p class="plan-name">{{ t('profile.client.plan.name') }}</p>
            <p class="plan-price">{{ t('profile.client.plan.price') }}</p>
          </div>
          <button class="btn btn--accent">{{ t('profile.client.plan.upgrade') }}</button>
        </div>
        <p class="plan-features-title">{{ t('profile.client.plan.featuresTitle') }}</p>
        <ul class="plan-features">
          <li>{{ t('profile.client.plan.feature1') }}</li>
          <li>{{ t('profile.client.plan.feature2') }}</li>
          <li>{{ t('profile.client.plan.feature3') }}</li>
          <li>{{ t('profile.client.plan.feature4') }}</li>
        </ul>
        <p class="plan-renewal">{{ t('profile.client.plan.renewal') }}: {{ t('profile.client.plan.renewalDate') }}</p>
      </div>

      <!-- Account info + edit -->
      <div class="card section">
        <h2 class="section-title">{{ t('profile.account.title') }}</h2>
        <div class="account-grid">
          <div class="account-field">
            <label>{{ t('profile.account.email') }}</label>
            <p>{{ profilesStore.myProfile?.email ?? '—' }}</p>
          </div>
          <div class="account-field">
            <label>{{ t('profile.account.phone') }}</label>
            <p>{{ profilesStore.myProfile?.phoneNumber ?? '—' }}</p>
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
        <h2 class="section-title">{{ t('profile.client.notifications.title') }}</h2>
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

      <!-- Security (client) -->
      <div class="card section">
        <h2 class="section-title">{{ t('profile.security.title') }}</h2>
        <div class="security-actions">
          <button class="btn btn--outline">
            <span class="material-icons" style="font-size:16px">lock</span>
            {{ t('profile.security.changePassword') }}
          </button>
        </div>
      </div>
    </template>

    <!-- ── SHARED: Language ───────────────────────────────────────────────── -->
    <div class="card section">
      <h2 class="section-title">{{ t('profile.language.title') }}</h2>
      <label class="section-sub">{{ t('profile.language.label') }}</label>
      <div class="lang-options">
        <button class="btn lang-btn" :class="locale === 'es' ? 'btn--accent' : 'btn--outline'" @click="setLocale('es')">Español</button>
        <button class="btn lang-btn" :class="locale === 'en' ? 'btn--accent' : 'btn--outline'" @click="setLocale('en')">English</button>
      </div>
      <p class="section-hint">{{ t('profile.language.hint') }}</p>
    </div>

  </div>
</template>

<style scoped>
.page__header { align-items: center; display: flex; gap: .75rem; margin-bottom: 1.25rem; }
.role-badge { border-radius: 12px; font-size: .75rem; font-weight: 700; padding: .25rem .75rem; }
.role-badge--admin  { background: rgba(245,188,54,.2);  color: var(--accent); }
.role-badge--client { background: rgba(0,204,178,.15);  color: var(--teal); }

/* Profile header row */
.section-row { align-items: center; display: flex; gap: 1rem; }
.avatar-circle { align-items: center; background: var(--accent); border-radius: 50%; color: #000; display: flex; flex-shrink: 0; font-size: 1.1rem; font-weight: 700; height: 52px; justify-content: center; width: 52px; }
.profile-info { display: flex; flex-direction: column; gap: .15rem; }
.profile-name { font-size: 1rem; font-weight: 600; }
.profile-sub  { color: var(--text-secondary); font-size: .8rem; }
.readonly-val { color: var(--text-secondary); }

/* Account grid */
.account-grid { display: grid; gap: .75rem; grid-template-columns: repeat(3, 1fr); }
.account-field label { color: var(--text-secondary); display: block; font-size: .78rem; margin-bottom: .2rem; }
.account-field p { font-size: .85rem; }

/* Edit form */
.edit-form { margin-top: .75rem; }
.edit-grid  { display: grid; gap: .75rem; grid-template-columns: 1fr 1fr 1fr; margin-bottom: .75rem; }
.form-field { display: flex; flex-direction: column; gap: .3rem; }
.form-field label { color: var(--text-secondary); font-size: .78rem; }
.edit-actions { display: flex; gap: .5rem; }
.edit-btn { font-size: .8rem; margin-top: .75rem; }

/* Alerts */
.alert { border-radius: var(--radius); font-size: .8rem; margin-top: .5rem; padding: .5rem .75rem; }
.alert--error   { background: rgba(239,68,68,.1);  border: 1px solid rgba(239,68,68,.3);  color: var(--red); }
.alert--success { background: rgba(34,197,94,.1);  border: 1px solid rgba(34,197,94,.3);  color: var(--green); }

/* Gym */
.gym-row  { align-items: center; display: flex; gap: .75rem; margin-top: .5rem; }
.gym-icon { color: var(--accent); }
.gym-name { font-size: .95rem; font-weight: 600; }

/* Stats */
.stat-grid { display: grid; gap: .75rem; grid-template-columns: repeat(3, 1fr); margin-bottom: 1rem; }
.stat-card { align-items: center; cursor: pointer; display: flex; gap: .75rem; text-align: left; background: none; border: 1px solid var(--border); color: var(--text-primary); width: 100%; }
.stat-card:hover { border-color: var(--accent); }
.stat-icon-wrap { align-items: center; border-radius: 10px; display: flex; flex-shrink: 0; height: 44px; justify-content: center; width: 44px; }
.stat-icon-wrap--blue  { background: rgba(59,130,246,.12); }
.stat-icon-wrap--amber { background: rgba(245,188,54,.12); }
.stat-icon-wrap--red   { background: rgba(239,68,68,.12); }
.stat-icon--blue  .stat-icon { color: var(--blue); }
.stat-icon-wrap--blue  .stat-icon { color: var(--blue); }
.stat-icon-wrap--amber .stat-icon { color: var(--accent); }
.stat-icon-wrap--red   .stat-icon { color: var(--red); }
.stat-value { font-size: 1.4rem; font-weight: 700; }
.stat-label { color: var(--text-secondary); font-size: .75rem; }
.stat-arrow { color: var(--text-secondary); font-size: 18px; margin-left: auto; }

/* Membership */
.membership-empty   { color: var(--text-secondary); font-size: .85rem; margin-top: .75rem; }
.membership-body    { display: flex; flex-direction: column; gap: .4rem; margin-top: .75rem; }
.membership-row     { align-items: center; display: flex; gap: .75rem; }
.plan-name          { font-size: 1rem; font-weight: 700; }
.membership-dates   { color: var(--text-secondary); font-size: .82rem; }
.membership-downgrade { align-items: center; color: var(--accent); display: flex; font-size: .78rem; gap: .25rem; }

/* Badges */
.badge         { border-radius: 999px; font-size: .72rem; font-weight: 600; padding: 2px 10px; }
.badge--green  { background: rgba(34,197,94,.15);  color: var(--green); }
.badge--amber  { background: rgba(245,188,54,.15); color: var(--accent); }
.badge--outline{ background: transparent; border: 1px solid var(--border); color: var(--text-secondary); }

/* Change password accordion */
.pw-header { align-items: center; background: none; border: none; color: var(--text-primary); cursor: pointer; display: flex; justify-content: space-between; padding: 0; width: 100%; }
.pw-header:hover .section-title { color: var(--accent); }
.chevron      { color: var(--text-secondary); font-size: 1.2rem; transition: transform .2s; }
.chevron--open{ transform: rotate(180deg); }

/* Section */
.section       { margin-bottom: 1rem; }
.section-title { font-size: .9rem; font-weight: 600; margin-bottom: .5rem; }
.section-sub   { color: var(--text-secondary); display: block; font-size: .8rem; margin-bottom: .5rem; }
.section-hint  { color: var(--text-secondary); font-size: .75rem; margin-top: .5rem; }
.security-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: .25rem; }

/* Client: avatar card */
.avatar-card  { align-items: center; display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
.avatar-info  { flex: 1; }
.avatar-name  { font-size: .95rem; font-weight: 600; }
.avatar-email { color: var(--text-secondary); font-size: .8rem; }
.points-badge { align-items: center; display: flex; flex-direction: column; gap: .15rem; text-align: center; }
.points-val   { color: var(--accent); font-size: 1.3rem; font-weight: 700; }
.points-label { color: var(--text-secondary); font-size: .72rem; }

/* Client: plan card */
.plan-card          { margin-bottom: 1rem; }
.plan-header        { align-items: center; display: flex; justify-content: space-between; margin-bottom: .75rem; }
.plan-active        { background: rgba(34,197,94,.15); border-radius: 10px; color: var(--green); font-size: .72rem; font-weight: 600; padding: .15rem .5rem; }
.plan-price         { color: var(--text-secondary); font-size: .83rem; margin-top: .2rem; }
.plan-renewal       { color: var(--text-secondary); font-size: .78rem; margin-top: .75rem; }
.plan-features-title{ color: var(--text-secondary); font-size: .78rem; font-weight: 500; margin-bottom: .4rem; }
.plan-features      { color: var(--text-secondary); display: flex; flex-direction: column; font-size: .8rem; gap: .3rem; padding-left: 1.25rem; }
.plan-features li::marker { color: var(--accent); }
.btn--accent { background: var(--accent); border: none; color: #000; font-weight: 600; }

/* Client: notifications */
.notif-list  { display: flex; flex-direction: column; gap: .75rem; }
.notif-row   { align-items: center; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; padding-bottom: .75rem; }
.notif-info  { display: flex; flex-direction: column; gap: .1rem; }
.notif-title { font-size: .85rem; font-weight: 500; }
.notif-desc  { color: var(--text-secondary); font-size: .78rem; }
.toggle               { align-items: center; cursor: pointer; display: inline-flex; }
.toggle input         { display: none; }
.toggle-track         { background: var(--border); border-radius: 12px; height: 22px; position: relative; transition: background .2s; width: 44px; }
.toggle input:checked + .toggle-track { background: var(--accent); }
.toggle-track::after  { background: #fff; border-radius: 50%; content: ''; height: 16px; left: 3px; position: absolute; top: 3px; transition: transform .2s; width: 16px; }
.toggle input:checked + .toggle-track::after { transform: translateX(22px); }

/* Language */
.lang-options { display: flex; gap: .5rem; margin-top: .5rem; }
.lang-btn     { font-size: .85rem; padding: .35rem .9rem; }

@media (max-width: 768px) {
  .stat-grid   { grid-template-columns: 1fr 1fr; }
  .account-grid, .edit-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 500px) {
  .stat-grid   { grid-template-columns: 1fr; }
  .account-grid, .edit-grid { grid-template-columns: 1fr; }
}
</style>
