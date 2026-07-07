<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore }        from '@/authentication/application/auth.store.js';
import { useProfilesStore }    from '@/profiles/application/profiles.store.js';
import { useActiveGymStore }   from '@/profiles/application/active-gym.store.js';
import { useGymStore }         from '@/gym/application/gym.store.js';
import { useEquipmentStore }   from '@/gym/application/equipment.store.js';
import { useMaintenanceStore } from '@/maintenance/application/maintenance.store.js';
import { useMembershipStore }      from '@/membership/application/membership.store.js';
import { MembershipStatus }        from '@/membership/domain/model/membership.entity.js';
import { useAuthorizedDniStore }   from '@/gym/application/authorized-dni.store.js';

const { t, locale } = useI18n();
const router         = useRouter();
const auth           = useAuthStore();
const profilesStore  = useProfilesStore();
const activeGymStore = useActiveGymStore();
const gymStore       = useGymStore();
const equipStore     = useEquipmentStore();
const mainStore      = useMaintenanceStore();
const memberStore    = useMembershipStore();
const dniStore       = useAuthorizedDniStore();

const isAdmin = computed(() => auth.isAdmin);

// ── Admin: edit profile (always-on form) ─────────────────────────────────────
const editForm    = ref({ firstName: '', lastName: '', phoneNumber: '' });
const editSuccess = ref(false);

watch(() => profilesStore.myProfile, (p) => {
  if (!p || !auth.isAdmin) return;
  editForm.value = {
    firstName:   p.firstName   ?? '',
    lastName:    p.lastName    ?? '',
    phoneNumber: p.phoneNumber ?? '',
  };
}, { immediate: true });

async function submitEdit() {
  await profilesStore.updateMyProfile(editForm.value);
  if (!profilesStore.error) {
    editSuccess.value = true;
    setTimeout(() => { editSuccess.value = false; }, 3000);
  }
}

// ── Admin: change password (fixed section, no accordion) ─────────────────────
const pwForm       = ref({ current: '', next: '', confirm: '' });
const pwSuccess    = ref(false);
const pwMatchError = ref(false);

async function submitPassword() {
  auth.clearError();
  pwMatchError.value = false;
  if (pwForm.value.next !== pwForm.value.confirm) { pwMatchError.value = true; return; }
  try {
    await auth.changePassword(pwForm.value.current, pwForm.value.next);
    pwForm.value    = { current: '', next: '', confirm: '' };
    pwSuccess.value = true;
    setTimeout(() => { pwSuccess.value = false; }, 4000);
  } catch { /* auth.error set by store */ }
}

// ── Admin: membership ────────────────────────────────────────────────────────
const activeMembership = computed(() =>
  memberStore.memberships.find(m =>
    m.status !== MembershipStatus.Cancelled && m.status !== MembershipStatus.Expired
  ) ?? null
);

function memberStatusClass(status) {
  if (status === MembershipStatus.Active)                                                        return 'badge--green';
  if (status === MembershipStatus.Suspended || status === MembershipStatus.PendingCancellation)  return 'badge--amber';
  return 'badge--red'; // Cancelled, Expired
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtPrice(m) {
  if (!m || m.amount == null || !m.currency) return null;
  return `${m.currency} ${Number(m.amount).toLocaleString('en-US')}/mes`;
}

// ── Admin: stats ─────────────────────────────────────────────────────────────
const branchCount    = computed(() => gymStore.branches.length);
const equipmentCount = computed(() => equipStore.error ? '—' : equipStore.equipment.length);
const ticketCount    = computed(() => mainStore.tickets.length);

// ── Client: keep existing ────────────────────────────────────────────────────
const notifAvailability = ref(true);
const notifMaintenance  = ref(false);
const notifRewards      = ref(true);

function gymName(gymId) {
  return gymStore.gyms.find(g => g.id === gymId)?.name ?? `#${gymId}`;
}

async function switchGym(gymId) {
  await activeGymStore.changeActiveGym(gymId);
}

// Client account info: fields are always editable, seeded from the real profile once it loads.
const accountForm        = ref({ firstName: '', lastName: '', phoneNumber: '' });
const accountSaveSuccess = ref(false);

watch(() => profilesStore.myProfile, p => {
  if (!p) return;
  accountForm.value = { firstName: p.firstName ?? '', lastName: p.lastName ?? '', phoneNumber: p.phoneNumber ?? '' };
}, { immediate: true });

async function saveAccountInfo() {
  accountSaveSuccess.value = false;
  const firstName   = accountForm.value.firstName.trim();
  const lastName    = accountForm.value.lastName.trim();
  const phoneNumber = accountForm.value.phoneNumber.trim();
  const dni         = profilesStore.myProfile?.dni ?? '';
  if (!firstName || !lastName) return;
  await profilesStore.updateMyProfile({ firstName, lastName, phoneNumber, dni });
  if (!profilesStore.error) accountSaveSuccess.value = true;
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

onMounted(async () => {
  const id = auth.user?.id;
  if (!id) return;
  await profilesStore.loadMyProfile();
  if (auth.isAdmin) {
    if (!gymStore.gymChecked) await gymStore.loadAdminGym(id);
    const gymId = gymStore.currentGym?.id;
    await Promise.all([
      gymId ? gymStore.loadBranches(gymId) : Promise.resolve(),
      gymId ? dniStore.load(gymId) : Promise.resolve(),
      equipStore.loadEquipment(id),
      mainStore.loadTickets(id),
      memberStore.loadByClient(id),
    ]);
  } else {
    activeGymStore.loadAssociations();
    gymStore.loadGyms();
  }
});
</script>

<template>
  <div class="page profile-page">

    <!-- ── ADMIN PROFILE ──────────────────────────────────────────────────── -->
    <template v-if="isAdmin">
      <div class="page__header">
        <h1 class="page__title">{{ t('profile.admin.title') }}</h1>
        <span class="role-badge role-badge--admin">{{ t('profile.admin.roleBadge') }}</span>
      </div>

      <!-- 1. Account Information — always-on form -->
      <div class="card section">
        <div class="section-row" style="margin-bottom:1.25rem">
          <div class="avatar-circle">{{ initials(profilesStore.myProfile?.fullName) }}</div>
          <div class="profile-info">
            <p class="profile-name">{{ profilesStore.loading ? '…' : (profilesStore.myProfile?.fullName || '—') }}</p>
            <p class="profile-sub">{{ profilesStore.myProfile?.email ?? '—' }}</p>
          </div>
        </div>

        <h2 class="section-title">{{ t('profile.account.title') }}</h2>

        <form class="account-form" @submit.prevent="submitEdit">
          <div class="form-field">
            <label>{{ t('profile.account.email') }}</label>
            <input :value="profilesStore.myProfile?.email ?? ''" disabled />
          </div>
          <div class="form-field">
            <label>{{ t('profile.account.dni') }}</label>
            <input :value="profilesStore.myProfile?.dni ?? ''" disabled />
          </div>
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
          <div class="form-field">
            <label>{{ t('profile.account.gymName') }}</label>
            <input :value="gymStore.currentGym?.name ?? ''" disabled />
          </div>
          <div v-if="profilesStore.error" class="alert alert--error">{{ profilesStore.error }}</div>
          <div v-if="editSuccess"         class="alert alert--success">{{ t('profile.actions.saveSuccess') }}</div>
          <button type="submit" class="btn btn--primary" :disabled="profilesStore.loading">
            {{ t('profile.actions.save') }}
          </button>
        </form>
      </div>

      <!-- 2. Stats -->
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
        <button class="card stat-card" @click="router.push('/gym/whitelist')">
          <div class="stat-icon-wrap stat-icon-wrap--teal">
            <span class="material-icons stat-icon">how_to_reg</span>
          </div>
          <div>
            <p class="stat-value">{{ dniStore.dnis.length }}</p>
            <p class="stat-label">{{ t('profile.admin.stats.members') }}</p>
          </div>
          <span class="material-icons stat-arrow">chevron_right</span>
        </button>
      </div>

      <!-- 3. Membership Card -->
      <div class="card section">
        <div class="section-row" style="justify-content:space-between;margin-bottom:.75rem">
          <h2 class="section-title" style="margin:0">{{ t('profile.admin.membership.title') }}</h2>
          <button class="btn btn--primary" style="font-size:.8rem" @click="router.push('/membership')">
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
            <span class="plan-name">
              {{ activeMembership.plan }}
              <span v-if="fmtPrice(activeMembership)" class="plan-price-inline">· {{ fmtPrice(activeMembership) }}</span>
            </span>
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

      <!-- 4. Change Password — fixed section, no accordion -->
      <div class="card section">
        <h2 class="section-title">{{ t('profile.security.changePassword') }}</h2>

        <form class="account-form" @submit.prevent="submitPassword">
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
          <div v-if="pwMatchError" class="alert alert--error">{{ t('profile.security.passwordMismatch') }}</div>
          <div v-if="auth.error"   class="alert alert--error">{{ auth.error }}</div>
          <div v-if="pwSuccess"    class="alert alert--success">{{ t('profile.security.passwordChanged') }}</div>
          <button type="submit" class="btn btn--primary" :disabled="auth.loading">
            {{ t('profile.security.updatePassword') }}
          </button>
        </form>
      </div>
    </template>

    <!-- ── CLIENT PROFILE ─────────────────────────────────────────────────── -->
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

      <!-- Account info -->
      <div class="card section">
        <div class="card-header">
          <span class="material-icons card-header__icon">manage_accounts</span>
          <h2 class="section-title">{{ t('profile.account.title') }}</h2>
        </div>

        <div class="form-group">
          <label>{{ t('profile.account.email') }}</label>
          <input type="email" :value="profilesStore.myProfile?.email ?? ''" disabled />
        </div>
        <div class="form-group">
          <label>{{ t('profile.account.firstName') }}</label>
          <input type="text" v-model="accountForm.firstName" />
        </div>
        <div class="form-group">
          <label>{{ t('profile.account.lastName') }}</label>
          <input type="text" v-model="accountForm.lastName" />
        </div>
        <div class="form-group">
          <label>{{ t('profile.account.phone') }}</label>
          <input type="tel" v-model="accountForm.phoneNumber" />
        </div>
        <div class="form-group">
          <label>{{ t('profile.account.dni') }}</label>
          <input type="text" :value="profilesStore.myProfile?.dni ?? ''" disabled />
        </div>

        <p v-if="accountSaveSuccess" class="save-success">
          <span class="material-icons" style="font-size:16px">check_circle</span>
          {{ t('profile.account.saveSuccess') }}
        </p>
        <p v-if="profilesStore.error" class="save-error">
          <span class="material-icons" style="font-size:16px">error_outline</span>
          {{ profilesStore.error }}
        </p>

        <button class="btn btn--primary save-btn" :disabled="profilesStore.loading" @click="saveAccountInfo">
          {{ t('profile.saveChanges') }}
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

    <!-- ── SHARED: Language ───────────────────────────────────────────────── -->
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
.role-badge--admin  { background: rgba(245,188,54,.2);  color: var(--accent); }
.role-badge--client { background: rgba(0,204,178,.15);  color: var(--teal); }

/* Profile header row */
.section-row  { align-items: center; display: flex; gap: 1rem; }
.avatar-circle { align-items: center; background: var(--accent); border-radius: 50%; color: #000; display: flex; flex-shrink: 0; font-size: 1.1rem; font-weight: 700; height: 52px; justify-content: center; width: 52px; }
.profile-info { display: flex; flex-direction: column; gap: .15rem; }
.profile-name { font-size: 1rem; font-weight: 600; }
.profile-sub  { color: var(--text-secondary); font-size: .8rem; }

/* Account form (admin — always-on stacked fields) */
.account-form { display: flex; flex-direction: column; gap: .75rem; }
.form-field   { display: flex; flex-direction: column; gap: .3rem; }
.form-field label { color: var(--text-secondary); font-size: .78rem; font-weight: 500; }
input:disabled { cursor: not-allowed; opacity: .5; }

/* Alerts */
.alert { border-radius: var(--radius); font-size: .8rem; padding: .5rem .75rem; }
.alert--error   { background: rgba(239,68,68,.1);  border: 1px solid rgba(239,68,68,.3);  color: var(--red); }
.alert--success { background: rgba(34,197,94,.1);  border: 1px solid rgba(34,197,94,.3);  color: var(--green); }

/* Stats */
.stat-grid { display: grid; gap: .75rem; grid-template-columns: repeat(4, 1fr); margin-bottom: 1rem; }
.stat-card { align-items: center; background: none; border: 1px solid var(--border); color: var(--text-primary); cursor: pointer; display: flex; gap: .75rem; text-align: left; width: 100%; }
.stat-card:hover { border-color: var(--accent); }
.stat-icon-wrap { align-items: center; border-radius: 10px; display: flex; flex-shrink: 0; height: 44px; justify-content: center; width: 44px; }
.stat-icon-wrap--blue  { background: rgba(59,130,246,.12); }
.stat-icon-wrap--amber { background: rgba(245,188,54,.12); }
.stat-icon-wrap--red   { background: rgba(239,68,68,.12); }
.stat-icon-wrap--teal  { background: rgba(0,204,178,.12); }
.stat-icon-wrap--blue  .stat-icon { color: var(--blue); }
.stat-icon-wrap--amber .stat-icon { color: var(--accent); }
.stat-icon-wrap--red   .stat-icon { color: var(--red); }
.stat-icon-wrap--teal  .stat-icon { color: var(--teal); }
.stat-value { font-size: 1.4rem; font-weight: 700; }
.stat-label { color: var(--text-secondary); font-size: .75rem; }
.btn--accent { background: var(--accent); border: none; color: #000; font-weight: 600; }
.btn--danger { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); color: var(--red); }
.avatar-circle { align-items: center; background: var(--accent); border-radius: 50%; color: #000; display: flex; font-size: 1.1rem; font-weight: 700; height: 56px; justify-content: center; width: 56px; }
.stat-arrow { color: var(--text-secondary); font-size: 18px; margin-left: auto; }

/* Membership */
.membership-empty    { color: var(--text-secondary); font-size: .85rem; }
.membership-body     { display: flex; flex-direction: column; gap: .4rem; }
.membership-row      { align-items: center; display: flex; gap: .75rem; }
.plan-name           { font-size: 1rem; font-weight: 700; }
.plan-price-inline   { color: var(--text-secondary); font-size: .85rem; font-weight: 400; }
.membership-dates    { color: var(--text-secondary); font-size: .82rem; }
.membership-downgrade { align-items: center; color: var(--accent); display: flex; font-size: .78rem; gap: .25rem; }

/* Badges */
.badge         { border-radius: 999px; font-size: .72rem; font-weight: 600; padding: 2px 10px; }
.badge--green  { background: rgba(34,197,94,.15);  color: var(--green); }
.badge--amber  { background: rgba(245,188,54,.15); color: var(--accent); }
.badge--red    { background: rgba(239,68,68,.15);  color: var(--red); }

/* Section */
.section       { margin-bottom: 1rem; }
.section-title { font-size: .9rem; font-weight: 600; margin-bottom: .75rem; }
.section-sub   { color: var(--text-secondary); display: block; font-size: .8rem; margin-bottom: .5rem; }
.section-hint  { color: var(--text-secondary); font-size: .75rem; margin-top: .5rem; }

/* Client: avatar card */
.avatar-card  { align-items: center; display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
.avatar-info  { flex: 1; }
.avatar-name  { font-size: .95rem; font-weight: 600; }
.avatar-email { color: var(--text-secondary); font-size: .8rem; }
.form-group { display: flex; flex-direction: column; gap: .4rem; margin-bottom: 1rem; }
.form-group:last-of-type { margin-bottom: 0; }
.form-group label { color: var(--text-secondary); font-size: .8rem; font-weight: 500; }
.form-group input:disabled { color: var(--text-secondary); cursor: not-allowed; opacity: .7; }
.save-success, .save-error { align-items: center; border-radius: 8px; display: flex; font-size: .82rem; gap: .4rem; margin-top: .75rem; padding: .6rem .8rem; }
.save-success { background: rgba(34,197,94,.1); color: var(--green); }
.save-error { background: rgba(239,68,68,.1); color: var(--red); }
.save-btn { margin-top: 1rem; width: 100%; }
.notif-list { display: flex; flex-direction: column; gap: .75rem; }
.notif-row { align-items: center; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; padding-bottom: .75rem; }
.notif-info { display: flex; flex-direction: column; gap: .1rem; }
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
.lang-btn { font-size: .85rem; padding: .35rem .9rem; }
.security-actions { display: flex; flex-direction: column; gap: .6rem; margin-top: .25rem; }
.security-btn { align-items: center; display: flex; gap: .4rem; justify-content: flex-start; width: 100%; }

@media (max-width: 900px) { .stat-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 500px) { .stat-grid { grid-template-columns: 1fr; } }
</style>
