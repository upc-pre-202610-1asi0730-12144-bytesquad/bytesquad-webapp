<script setup>
import { ref } from 'vue';
import { useMembershipStore }   from '@/membership/application/membership.store.js';
import { useBranchAccessStore } from '@/membership/application/branch-access.store.js';
import { MembershipPlan, MembershipStatus } from '@/membership/domain/model/membership.entity.js';
import { BranchAccessStatus } from '@/membership/domain/model/branch-access.entity.js';

const membershipStore   = useMembershipStore();
const branchAccessStore = useBranchAccessStore();

const activeTab = ref('membership');

// ── Activate form ──────────────────────────────────────────────────────────
const activateForm = ref({ clientId: '', plan: MembershipPlan.Basic, startDate: '', endDate: '' });

async function submitActivate() {
  if (!activateForm.value.clientId || !activateForm.value.startDate || !activateForm.value.endDate) return;
  await membershipStore.activate(
    Number(activateForm.value.clientId),
    activateForm.value.plan,
    activateForm.value.startDate,
    activateForm.value.endDate,
  );
  activateForm.value = { clientId: '', plan: MembershipPlan.Basic, startDate: '', endDate: '' };
}

// ── Search by client ───────────────────────────────────────────────────────
const searchClientId = ref('');

async function searchByClient() {
  if (!searchClientId.value) return;
  await membershipStore.loadByClient(Number(searchClientId.value));
}

// ── Inline actions ─────────────────────────────────────────────────────────
const renewForm = ref({ id: null, newEndDate: '' });
const planForm  = ref({ id: null, newPlan: MembershipPlan.Basic });

async function submitRenew(m) {
  if (!renewForm.value.newEndDate) return;
  await membershipStore.renew(m.id, renewForm.value.newEndDate);
  renewForm.value = { id: null, newEndDate: '' };
}

async function submitPlan(m) {
  await membershipStore.changePlan(m.id, planForm.value.newPlan);
  planForm.value = { id: null, newPlan: MembershipPlan.Basic };
}

// ── Grant form ─────────────────────────────────────────────────────────────
const grantForm = ref({ membershipId: '', branchId: '', grantedByAdminId: '' });

async function submitGrant() {
  if (!grantForm.value.membershipId || !grantForm.value.branchId || !grantForm.value.grantedByAdminId) return;
  await branchAccessStore.grant(
    Number(grantForm.value.membershipId),
    Number(grantForm.value.branchId),
    Number(grantForm.value.grantedByAdminId),
  );
  grantForm.value = { membershipId: '', branchId: '', grantedByAdminId: '' };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function statusClass(s) {
  if (s === MembershipStatus.Active) return 'green';
  if (s === MembershipStatus.Suspended || s === MembershipStatus.PendingCancellation) return 'amber';
  return 'red';
}

function accessClass(s) {
  return s === BranchAccessStatus.Granted ? 'green' : 'red';
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">Membership Management</h1>
    </div>

    <div class="tabs">
      <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'membership' }"    @click="activeTab = 'membership'">Memberships</button>
      <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'branchAccess' }"  @click="activeTab = 'branchAccess'">Branch Access</button>
    </div>

    <div v-if="membershipStore.error || branchAccessStore.error" class="error-banner card">
      {{ membershipStore.error || branchAccessStore.error }}
    </div>

    <!-- ── MEMBERSHIP TAB ──────────────────────────────────────────────────── -->
    <template v-if="activeTab === 'membership'">

      <!-- Activate form -->
      <form class="card form-grid" @submit.prevent="submitActivate">
        <h2 class="form-title">Activate Membership</h2>
        <div class="form-field">
          <label>Client ID</label>
          <input type="number" v-model.number="activateForm.clientId" placeholder="clientId" required />
        </div>
        <div class="form-field">
          <label>Plan</label>
          <select v-model="activateForm.plan">
            <option v-for="p in Object.values(MembershipPlan)" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div class="form-field">
          <label>Start Date</label>
          <input type="date" v-model="activateForm.startDate" required />
        </div>
        <div class="form-field">
          <label>End Date</label>
          <input type="date" v-model="activateForm.endDate" required />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn--primary" :disabled="membershipStore.loading">Activate</button>
        </div>
      </form>

      <!-- Search by client -->
      <div class="card search-row">
        <input type="number" v-model.number="searchClientId" placeholder="Search by Client ID" />
        <button class="btn btn--outline" :disabled="membershipStore.loading" @click="searchByClient">Load</button>
      </div>

      <!-- Memberships table -->
      <div v-if="membershipStore.memberships.length" class="card" style="padding:0;overflow:hidden">
        <table class="data-table">
          <thead><tr>
            <th>ID</th><th>Client</th><th>Plan</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            <tr v-for="m in membershipStore.memberships" :key="m.id">
              <td class="cell-id">{{ m.id }}</td>
              <td>{{ m.clientId }}</td>
              <td>{{ m.plan }}</td>
              <td style="font-size:.78rem">{{ m.startDate?.slice(0,10) }}</td>
              <td style="font-size:.78rem">{{ m.endDate?.slice(0,10) }}</td>
              <td>
                <span class="badge" :class="`badge--${statusClass(m.status)}`">{{ m.status }}</span>
                <span v-if="m.status === MembershipStatus.PendingCancellation" class="pending-note">
                  active until {{ m.endDate?.slice(0, 10) }}
                </span>
              </td>
              <td class="actions">
                <button class="btn btn--icon" title="Suspend"
                  :disabled="m.status !== 'Active'"
                  @click="membershipStore.suspend(m.id)">
                  <span class="material-icons" style="font-size:16px">pause_circle</span>
                </button>
                <button class="btn btn--icon" title="Cancel"
                  :disabled="m.status === MembershipStatus.Cancelled || m.status === MembershipStatus.PendingCancellation"
                  @click="membershipStore.cancel(m.id)">
                  <span class="material-icons" style="font-size:16px;color:var(--red)">cancel</span>
                </button>
                <!-- Renew inline -->
                <template v-if="renewForm.id === m.id">
                  <input type="date" v-model="renewForm.newEndDate" style="font-size:.75rem;width:120px" />
                  <button class="btn btn--primary" style="font-size:.75rem" @click="submitRenew(m)">OK</button>
                  <button class="btn btn--outline" style="font-size:.75rem" @click="renewForm.id = null">✕</button>
                </template>
                <button v-else class="btn btn--icon" title="Renew"
                  @click="renewForm = { id: m.id, newEndDate: '' }">
                  <span class="material-icons" style="font-size:16px">autorenew</span>
                </button>
                <!-- Change plan inline -->
                <template v-if="planForm.id === m.id">
                  <select v-model="planForm.newPlan" style="font-size:.75rem">
                    <option v-for="p in Object.values(MembershipPlan)" :key="p" :value="p">{{ p }}</option>
                  </select>
                  <button class="btn btn--primary" style="font-size:.75rem" @click="submitPlan(m)">OK</button>
                  <button class="btn btn--outline" style="font-size:.75rem" @click="planForm.id = null">✕</button>
                </template>
                <button v-else class="btn btn--icon" title="Change plan"
                  @click="planForm = { id: m.id, newPlan: m.plan }">
                  <span class="material-icons" style="font-size:16px">swap_horiz</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="!membershipStore.loading" class="empty-state card">
        <span class="material-icons" style="font-size:36px;color:var(--text-secondary)">card_membership</span>
        <p style="color:var(--text-secondary);font-size:.85rem">No memberships loaded. Activate one or search by client ID.</p>
      </div>
    </template>

    <!-- ── BRANCH ACCESS TAB ───────────────────────────────────────────────── -->
    <template v-if="activeTab === 'branchAccess'">

      <form class="card form-grid" @submit.prevent="submitGrant">
        <h2 class="form-title">Grant Branch Access</h2>
        <div class="form-field">
          <label>Membership ID</label>
          <input type="number" v-model.number="grantForm.membershipId" placeholder="membershipId" required />
        </div>
        <div class="form-field">
          <label>Branch ID</label>
          <input type="number" v-model.number="grantForm.branchId" placeholder="branchId" required />
        </div>
        <div class="form-field">
          <label>Granted By Admin ID</label>
          <input type="number" v-model.number="grantForm.grantedByAdminId" placeholder="adminId" required />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn--primary" :disabled="branchAccessStore.loading">Grant Access</button>
        </div>
      </form>

      <!-- Accesses granted this session -->
      <div v-if="branchAccessStore.accesses.length" class="card" style="padding:0;overflow:hidden;margin-top:1rem">
        <table class="data-table">
          <thead><tr>
            <th>ID</th><th>Membership</th><th>Branch</th><th>Status</th><th>Granted By</th>
          </tr></thead>
          <tbody>
            <tr v-for="a in branchAccessStore.accesses" :key="a.id">
              <td class="cell-id">{{ a.id }}</td>
              <td>{{ a.membershipId }}</td>
              <td>{{ a.branchId }}</td>
              <td><span class="badge" :class="`badge--${accessClass(a.status)}`">{{ a.status }}</span></td>
              <td>{{ a.grantedByAdminId }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state card" style="margin-top:1rem">
        <!-- TODO: wire when backend adds GET /branch-accesses -->
        <span class="material-icons" style="font-size:36px;color:var(--text-secondary)">lock_open</span>
        <p style="color:var(--text-secondary);font-size:.85rem">No accesses granted this session.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tabs { display: flex; gap: .5rem; margin-bottom: 1rem; }
.tab-btn { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 20px; color: var(--text-secondary); cursor: pointer; font-size: .8rem; padding: .3rem .9rem; transition: all .15s; }
.tab-btn--active { background: var(--accent); border-color: var(--accent); color: #000; font-weight: 600; }
.form-grid { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; margin-bottom: 1rem; }
.form-title { color: var(--text-primary); font-size: .95rem; font-weight: 600; grid-column: 1 / -1; margin: 0; }
.form-field { display: flex; flex-direction: column; gap: .375rem; }
.form-field label { color: var(--text-secondary); font-size: .8rem; font-weight: 500; }
.form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; padding-top: .5rem; }
.search-row { align-items: center; display: flex; gap: .75rem; margin-bottom: 1rem; }
.search-row input { flex: 1; }
.data-table { border-collapse: collapse; font-size: .83rem; width: 100%; }
.data-table th { background: var(--bg-surface); border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 500; padding: .5rem .75rem; text-align: left; }
.data-table td { border-bottom: 1px solid rgba(255,255,255,.04); padding: .45rem .75rem; vertical-align: middle; }
.cell-id { color: var(--text-secondary); font-family: monospace; font-size: .75rem; }
.actions { align-items: center; display: flex; flex-wrap: wrap; gap: .25rem; }
.badge { border-radius: 999px; font-size: .7rem; font-weight: 600; padding: 2px 8px; }
.badge--green { background: rgba(34,197,94,.15); color: var(--green); }
.badge--amber { background: rgba(245,188,54,.15); color: var(--accent); }
.badge--red   { background: rgba(239,68,68,.15);  color: var(--red); }
.error-banner { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: var(--red); font-size: .85rem; margin-bottom: 1rem; padding: .75rem; }
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .75rem; padding: 2.5rem; text-align: center; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
.pending-note { color: var(--text-secondary); display: block; font-size: .68rem; margin-top: 2px; }
</style>
