<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore }         from '@/authentication/application/auth.store.js';
import { useMaintenanceStore }  from '@/maintenance/application/maintenance.store.js';
import { TechnicalTicketStatus, MaintenanceProgress } from '@/maintenance/domain/model/technical-ticket.entity.js';
import { useEquipmentStore }    from '@/gym/application/equipment.store.js';

const { t }      = useI18n();
const store      = useMaintenanceStore();
const equipStore = useEquipmentStore();
const auth       = useAuthStore();
const router     = useRouter();

onMounted(() => {
  const adminId = auth.user?.id;
  store.loadTickets(adminId);
  store.loadTechnicians();
  store.loadLogsByAdmin(adminId);
});

const search  = ref('');
const statusF = ref('');

// ── Request Maintenance form ───────────────────────────────────────────────
const reqExpanded = ref(false);
const reqForm     = ref({ equipmentId: '', reason: '' });

async function submitRequest() {
  if (!reqForm.value.equipmentId || !reqForm.value.reason) return;
  await store.requestMaintenance({
    equipmentId:        Number(reqForm.value.equipmentId),
    requestedByAdminId: auth.user?.id,
    reason:             reqForm.value.reason,
  });
  reqForm.value = { equipmentId: '', reason: '' };
  reqExpanded.value = false;
}

// ── Inline assign ──────────────────────────────────────────────────────────
const assignForm = ref({ ticketId: null, technicianId: '' });

async function submitAssign(ticket) {
  if (!assignForm.value.technicianId) return;
  await store.assignTicket(ticket.id, Number(assignForm.value.technicianId));
  assignForm.value = { ticketId: null, technicianId: '' };
}

// ── Complete with notes ────────────────────────────────────────────────────
const completeForm = ref({ ticketId: null, notes: '' });

async function submitComplete(ticket) {
  await store.completeTicket(ticket.id, completeForm.value.notes);
  completeForm.value = { ticketId: null, notes: '' };
}

// ── Completion log (lazy) ──────────────────────────────────────────────────
const expandedLogId = ref(null);

async function toggleLog(ticketId) {
  if (expandedLogId.value === ticketId) { expandedLogId.value = null; return; }
  expandedLogId.value = ticketId;
  await store.loadCompletionLog(ticketId);
}

// ── Technicians panel ──────────────────────────────────────────────────────
const techExpanded   = ref(false);
const techForm       = ref({ name: '', specialization: '', phoneNumber: '' });
const techSubmitting = ref(false);
const techError      = ref('');

async function submitTechnician() {
  if (!techForm.value.name || !techForm.value.specialization || !techForm.value.phoneNumber) {
    techError.value = t('maintenance.technicians.form.allRequired'); return;
  }
  techSubmitting.value = true; techError.value = '';
  try {
    await store.registerTechnician(techForm.value);
    techForm.value = { name: '', specialization: '', phoneNumber: '' };
  } catch (e) {
    techError.value = e.message;
  } finally { techSubmitting.value = false; }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function eq(id)       { return equipStore.equipment.find(e => e.id === id)?.name ?? `EQ-${id}`; }
function ticketId(id) { return `#${String(id).slice(-4).padStart(4, '0')}`; }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleString() : '—'; }

function filter(list) {
  const q = search.value.toLowerCase();
  return list.filter(t =>
    (!q || eq(t.equipmentId).toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) &&
    (!statusF.value || t.status === statusF.value)
  );
}

const openFiltered       = computed(() => filter(store.openTickets));
const inProgressFiltered = computed(() => filter(store.inProgressTickets));
const resolvedFiltered   = computed(() => filter(store.resolvedTickets));
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('maintenance.title') }}</h1>
      <div class="header-actions">
        <button class="btn btn--outline" @click="reqExpanded = !reqExpanded">
          <span class="material-icons" style="font-size:16px">build</span> Request Maintenance
        </button>
        <button class="btn btn--primary" @click="router.push('/maintenance/new-ticket')">
          <span class="material-icons" style="font-size:16px">add</span> {{ t('maintenance.newTicket') }}
        </button>
      </div>
    </div>

    <!-- Request Maintenance inline form -->
    <div v-if="reqExpanded" class="card req-form">
      <div class="req-fields">
        <div class="form-field">
          <label>Equipment</label>
          <select v-model="reqForm.equipmentId" required>
            <option disabled value="">— Equipment —</option>
            <option v-for="e in equipStore.equipment" :key="e.id" :value="e.id">{{ e.name }}</option>
          </select>
        </div>
        <div class="form-field">
          <label>Reason</label>
          <input v-model="reqForm.reason" placeholder="Reason for maintenance" />
        </div>
      </div>
      <div class="req-actions">
        <button class="btn btn--primary" :disabled="store.loading" @click="submitRequest">Submit</button>
        <button class="btn btn--outline" @click="reqExpanded = false">Cancel</button>
      </div>
    </div>

    <div v-if="store.error" class="error-banner card">{{ store.error }}</div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card card"><span class="stat-n">{{ store.tickets.length }}</span><span class="stat-l">{{ t('maintenance.stats.totalTickets') }}</span></div>
      <div class="stat-card card"><span class="stat-n stat-n--amber">{{ store.openTickets.length }}</span><span class="stat-l">{{ t('maintenance.stats.pending') }}</span></div>
      <div class="stat-card card"><span class="stat-n stat-n--blue">{{ store.inProgressTickets.length }}</span><span class="stat-l">{{ t('maintenance.stats.inProgress') }}</span></div>
      <div class="stat-card card"><span class="stat-n stat-n--green">{{ store.resolvedTickets.length }}</span><span class="stat-l">{{ t('maintenance.stats.completed') }}</span></div>
    </div>

    <!-- Filters -->
    <div class="filters card">
      <input v-model="search" placeholder="Search by equipment or description…" style="flex:1" />
      <select v-model="statusF">
        <option value="">All statuses</option>
        <option v-for="s in Object.values(TechnicalTicketStatus)" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <!-- Kanban -->
    <div class="kanban-board">

      <!-- Open (Created / Assigned) -->
      <div class="kanban-col card">
        <h3 class="col-header col-header--open">{{ t('maintenance.col.pending') }} ({{ openFiltered.length }})</h3>
        <p v-if="!openFiltered.length" class="kanban-empty">
          {{ store.tickets.length === 0 ? 'No tickets yet. Create one above.' : t('maintenance.col.empty') }}
        </p>
        <div v-for="ticket in openFiltered" :key="ticket.id" class="ticket-card ticket-card--open">
          <div class="ticket-top">
            <span class="ticket-id">{{ ticketId(ticket.id) }}</span>
            <span class="badge badge--open">{{ ticket.status }}</span>
          </div>
          <p class="ticket-eq">{{ eq(ticket.equipmentId) }}</p>
          <p class="ticket-desc">{{ ticket.description }}</p>
          <div class="progress-row">
            <span class="progress-label">Progress:</span>
            <select class="progress-select" :value="ticket.maintenanceProgress"
              @change="store.updateTicketMaintenanceProgress(ticket.id, $event.target.value)">
              <option v-for="p in Object.values(MaintenanceProgress)" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="ticket-actions">
            <button class="btn btn--outline" style="font-size:.75rem"
              @click="store.updateTicketStatus(ticket.id, 'InProgress')" :disabled="store.loading">
              Start
            </button>
            <template v-if="assignForm.ticketId === ticket.id">
              <select v-model="assignForm.technicianId" style="font-size:.75rem;flex:1"
                      :disabled="!store.technicians.length">
                <option disabled value="">{{ store.technicians.length ? `— ${t('maintenance.assignedTo')} —` : t('maintenance.technicians.noneYet') }}</option>
                <option v-for="tech in store.technicians" :key="tech.id" :value="tech.id">
                  {{ tech.name }} · {{ tech.specialization }}
                </option>
              </select>
              <button class="btn btn--primary" style="font-size:.75rem" @click="submitAssign(ticket)" :disabled="!assignForm.technicianId">OK</button>
              <button class="btn btn--outline" style="font-size:.75rem" @click="assignForm.ticketId = null">✕</button>
            </template>
            <button v-else class="btn btn--outline" style="font-size:.75rem"
              @click="assignForm = { ticketId: ticket.id, technicianId: '' }">
              Assign
            </button>
          </div>
        </div>
      </div>

      <!-- InProgress -->
      <div class="kanban-col card">
        <h3 class="col-header col-header--progress">{{ t('maintenance.col.inProgress') }} ({{ inProgressFiltered.length }})</h3>
        <p v-if="!inProgressFiltered.length" class="kanban-empty">{{ t('maintenance.col.empty') }}</p>
        <div v-for="ticket in inProgressFiltered" :key="ticket.id" class="ticket-card ticket-card--progress">
          <div class="ticket-top">
            <span class="ticket-id">{{ ticketId(ticket.id) }}</span>
            <span class="badge badge--progress">{{ ticket.status }}</span>
          </div>
          <p class="ticket-eq">{{ eq(ticket.equipmentId) }}</p>
          <p class="ticket-desc">{{ ticket.description }}</p>
          <div class="progress-row">
            <span class="progress-label">Progress:</span>
            <select class="progress-select" :value="ticket.maintenanceProgress"
              @change="store.updateTicketMaintenanceProgress(ticket.id, $event.target.value)">
              <option v-for="p in Object.values(MaintenanceProgress)" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="ticket-actions">
            <template v-if="completeForm.ticketId === ticket.id">
              <input v-model="completeForm.notes" :placeholder="t('maintenance.complete.notesPlaceholder')"
                style="flex:1;font-size:.75rem" />
              <button class="btn btn--primary" style="font-size:.75rem" @click="submitComplete(ticket)" :disabled="store.loading">OK</button>
              <button class="btn btn--outline" style="font-size:.75rem" @click="completeForm.ticketId = null">✕</button>
            </template>
            <template v-else>
              <button class="btn btn--primary" style="font-size:.75rem"
                @click="completeForm = { ticketId: ticket.id, notes: '' }" :disabled="store.loading">
                {{ t('maintenance.action.complete') }}
              </button>
              <button class="btn btn--outline" style="font-size:.75rem"
                @click="store.requestTicketStatusUpdate(ticket.id)" :disabled="store.loading">
                Req. Update
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Resolved -->
      <div class="kanban-col card">
        <h3 class="col-header col-header--resolved">{{ t('maintenance.col.completed') }} ({{ resolvedFiltered.length }})</h3>
        <p v-if="!resolvedFiltered.length" class="kanban-empty">{{ t('maintenance.col.empty') }}</p>
        <div v-for="ticket in resolvedFiltered" :key="ticket.id" class="ticket-card ticket-card--resolved">
          <div class="ticket-top">
            <span class="ticket-id">{{ ticketId(ticket.id) }}</span>
            <span class="badge badge--resolved">{{ ticket.status }}</span>
          </div>
          <p class="ticket-eq">{{ eq(ticket.equipmentId) }}</p>
          <p class="ticket-desc">{{ ticket.description }}</p>
          <div class="progress-row">
            <span class="progress-label">Progress:</span>
            <span class="badge badge--prog-done">{{ ticket.maintenanceProgress }}</span>
          </div>
          <button class="btn btn--outline" style="font-size:.72rem;margin-top:.25rem;width:100%"
                  @click="toggleLog(ticket.id)">
            <span class="material-icons" style="font-size:13px">{{ expandedLogId === ticket.id ? 'expand_less' : 'expand_more' }}</span>
            {{ t('maintenance.log.view') }}
          </button>
          <div v-if="expandedLogId === ticket.id" class="log-panel">
            <template v-if="store.completionLogs[ticket.id]">
              <p class="log-date">{{ fmtDate(store.completionLogs[ticket.id].completedAt) }}</p>
              <p class="log-notes">{{ store.completionLogs[ticket.id].notes || t('maintenance.log.noNotes') }}</p>
            </template>
            <p v-else class="log-notes" style="color:var(--text-secondary)">…</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Technicians Panel -->
    <div class="section-header">
      <h2 class="section-title">{{ t('maintenance.technicians.title') }} ({{ store.technicians.length }})</h2>
      <button class="btn btn--outline" style="font-size:.8rem" @click="techExpanded = !techExpanded">
        <span class="material-icons" style="font-size:16px">person_add</span>
        {{ t('maintenance.technicians.register') }}
      </button>
    </div>

    <div v-if="techExpanded" class="card req-form">
      <div class="req-fields req-fields--3">
        <div class="form-field">
          <label>{{ t('maintenance.technicians.name') }}</label>
          <input v-model="techForm.name" :placeholder="t('maintenance.technicians.form.namePlaceholder')" />
        </div>
        <div class="form-field">
          <label>{{ t('maintenance.technicians.specialization') }}</label>
          <input v-model="techForm.specialization" :placeholder="t('maintenance.technicians.form.specializationPlaceholder')" />
        </div>
        <div class="form-field">
          <label>{{ t('maintenance.technicians.phone') }}</label>
          <input v-model="techForm.phoneNumber" :placeholder="t('maintenance.technicians.form.phonePlaceholder')" />
        </div>
      </div>
      <p v-if="techError" class="form-error">{{ techError }}</p>
      <div class="req-actions">
        <button class="btn btn--primary" :disabled="techSubmitting" @click="submitTechnician">
          {{ techSubmitting ? '…' : t('maintenance.technicians.form.submit') }}
        </button>
        <button class="btn btn--outline" @click="techExpanded = false">{{ t('maintenance.form.cancel') }}</button>
      </div>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <table class="data-table">
        <thead><tr>
          <th>{{ t('maintenance.technicians.name') }}</th>
          <th>{{ t('maintenance.technicians.specialization') }}</th>
          <th>{{ t('maintenance.technicians.phone') }}</th>
        </tr></thead>
        <tbody>
          <tr v-if="!store.technicians.length">
            <td colspan="3" class="table-empty">{{ t('maintenance.technicians.noData') }}</td>
          </tr>
          <tr v-for="tech in store.technicians" :key="tech.id">
            <td>{{ tech.name }}</td>
            <td>{{ tech.specialization }}</td>
            <td>{{ tech.phoneNumber }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page__header    { align-items: center; display: flex; justify-content: space-between; margin-bottom: 1rem; }
.header-actions  { display: flex; gap: .5rem; }
.req-form        { margin-bottom: 1rem; }
.req-fields      { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; margin-bottom: .75rem; }
.req-fields--3   { grid-template-columns: 1fr 1fr 1fr; }
.req-actions     { display: flex; gap: .5rem; justify-content: flex-end; }
.form-field      { display: flex; flex-direction: column; gap: .375rem; }
.form-field label { color: var(--text-secondary); font-size: .8rem; font-weight: 500; }
.form-error      { color: var(--red); font-size: .78rem; margin-bottom: .25rem; }
.error-banner    { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: var(--red); font-size: .85rem; margin-bottom: 1rem; padding: .75rem; }
.stats-row       { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); margin-bottom: 1rem; }
.stat-card       { align-items: center; display: flex; flex-direction: column; gap: .25rem; }
.stat-n          { font-size: 1.75rem; font-weight: 700; }
.stat-n--amber   { color: var(--accent); } .stat-n--blue { color: var(--blue); } .stat-n--green { color: var(--green); }
.stat-l          { color: var(--text-secondary); font-size: .8rem; }
.filters         { display: flex; gap: .75rem; margin-bottom: 1rem; }
.kanban-board    { display: grid; gap: 1rem; grid-template-columns: repeat(3, 1fr); }
.kanban-col      { display: flex; flex-direction: column; gap: .5rem; }
.col-header      { border-bottom: 1px solid var(--border); font-size: .85rem; font-weight: 600; margin-bottom: .25rem; padding-bottom: .5rem; }
.col-header--open     { color: var(--accent); }
.col-header--progress { color: var(--blue); }
.col-header--resolved { color: var(--green); }
.kanban-empty    { color: var(--text-secondary); font-size: .8rem; }
.ticket-card     { border-left: 3px solid; border-radius: 6px; display: flex; flex-direction: column; gap: .35rem; font-size: .82rem; padding: .625rem .75rem; }
.ticket-card--open     { background: rgba(245,188,54,.06); border-color: var(--accent); }
.ticket-card--progress { background: rgba(59,130,246,.06); border-color: var(--blue); }
.ticket-card--resolved { background: rgba(34,197,94,.06); border-color: var(--green); }
.ticket-top      { align-items: center; display: flex; justify-content: space-between; }
.ticket-id       { color: var(--text-secondary); font-family: monospace; font-size: .75rem; }
.ticket-eq       { font-weight: 500; }
.ticket-desc     { color: var(--text-secondary); font-size: .78rem; }
.progress-row    { align-items: center; display: flex; gap: .5rem; }
.progress-label  { color: var(--text-secondary); font-size: .75rem; }
.progress-select { font-size: .75rem; padding: 1px 4px; }
.ticket-actions  { align-items: center; display: flex; flex-wrap: wrap; gap: .3rem; }
.log-panel       { background: rgba(255,255,255,.03); border-radius: 4px; padding: .5rem .6rem; }
.log-date        { color: var(--text-secondary); font-size: .72rem; }
.log-notes       { font-size: .78rem; margin-top: .2rem; }
.badge           { border-radius: 999px; font-size: .7rem; font-weight: 600; padding: 2px 8px; }
.badge--open     { background: rgba(245,188,54,.15); color: var(--accent); }
.badge--progress { background: rgba(59,130,246,.15); color: var(--blue); }
.badge--resolved { background: rgba(34,197,94,.15); color: var(--green); }
.badge--prog-done { background: rgba(255,255,255,.08); color: var(--text-secondary); }
.section-header  { align-items: center; display: flex; justify-content: space-between; margin-bottom: .5rem; margin-top: 1.5rem; }
.section-title   { font-size: .9rem; font-weight: 600; }
.data-table      { border-collapse: collapse; font-size: .85rem; width: 100%; }
.data-table th   { background: var(--bg-surface); border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 500; padding: .5rem .75rem; text-align: left; }
.data-table td   { border-bottom: 1px solid rgba(255,255,255,.04); padding: .5rem .75rem; }
.table-empty     { color: var(--text-secondary); padding: 1.5rem; text-align: center; }
@media (max-width: 900px) { .kanban-board, .stats-row { grid-template-columns: 1fr; } .req-fields--3 { grid-template-columns: 1fr; } }
</style>
