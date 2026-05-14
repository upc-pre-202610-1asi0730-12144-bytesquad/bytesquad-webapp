<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMaintenanceStore } from '@/maintenance/application/maintenance.store.js';
import { TicketStatus, TicketPriority } from '@/maintenance/domain/model/maintenance-ticket.entity.js';
import { useEquipmentStore } from '@/equipment/application/equipment.store.js';

const { t }    = useI18n();
const store    = useMaintenanceStore();
const equipStore = useEquipmentStore();
const router   = useRouter();

const search   = ref('');
const statusF  = ref('');
const priorityF= ref('');

function eq(id) { return equipStore.equipment.find(e => e.id === id)?.name ?? `EQ-${id}`; }
function ticketId(id) { return `#${String(id).slice(-4).padStart(4,'0')}`; }
function ticketAge(createdAt) {
  const diff = Date.now() - new Date(createdAt).getTime();
  const h = Math.floor(diff / 3600000);
  return h < 24 ? `${h}h` : `${Math.floor(h/24)}d`;
}
function priorityClass(p) { return p === 'URGENT' ? 'red' : p === 'HIGH' ? 'amber' : p === 'MEDIUM' ? 'blue' : 'gray'; }

function filter(list) {
  const q = search.value.toLowerCase();
  return list.filter(t =>
    (!q || eq(t.equipmentId).toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) &&
    (!statusF.value || t.status === statusF.value) &&
    (!priorityF.value || t.priority === priorityF.value)
  );
}

const pendingFiltered    = computed(() => filter(store.pendingTickets));
const inProgressFiltered = computed(() => filter(store.inProgressTickets));
const resolvedFiltered   = computed(() => filter(store.resolvedTickets));
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('maintenance.title') }}</h1>
      <button class="btn btn--primary" @click="router.push('/maintenance/new-ticket')">
        <span class="material-icons" style="font-size:16px">add</span> {{ t('maintenance.newTicket') }}
      </button>
    </div>

    <div class="stats-row">
      <div class="stat-card card"><span class="stat-n">{{ store.totalTickets }}</span><span class="stat-l">{{ t('maintenance.stats.totalTickets') }}</span></div>
      <div class="stat-card card"><span class="stat-n stat-n--amber">{{ store.pendingTickets.length }}</span><span class="stat-l">{{ t('maintenance.stats.pending') }}</span></div>
      <div class="stat-card card"><span class="stat-n stat-n--blue">{{ store.inProgressTickets.length }}</span><span class="stat-l">{{ t('maintenance.stats.inProgress') }}</span></div>
      <div class="stat-card card"><span class="stat-n stat-n--green">{{ store.resolvedTickets.length }}</span><span class="stat-l">{{ t('maintenance.stats.completed') }}</span></div>
    </div>

    <div class="filters card">
      <input v-model="search" :placeholder="t('maintenance.search')" style="flex:1" />
      <select v-model="statusF"><option value="">{{ t('maintenance.filter.allStatuses') }}</option><option v-for="s in Object.values(TicketStatus)" :key="s" :value="s">{{ s }}</option></select>
      <select v-model="priorityF"><option value="">{{ t('maintenance.filter.allPriorities') }}</option><option v-for="p in Object.values(TicketPriority)" :key="p" :value="p">{{ p }}</option></select>
    </div>

    <div class="kanban-board">
      <div class="kanban-col card">
        <h3 class="col-header col-header--open">{{ t('maintenance.col.pending') }} ({{ pendingFiltered.length }})</h3>
        <p v-if="!pendingFiltered.length" class="kanban-empty">{{ t('maintenance.col.empty') }}</p>
        <div v-for="ticket in pendingFiltered" :key="ticket.id" class="ticket-card ticket-card--open">
          <div class="ticket-top">
            <span class="ticket-id">{{ ticketId(ticket.id) }}</span>
            <span class="badge" :class="`badge--${priorityClass(ticket.priority)}`">{{ ticket.priority }}</span>
          </div>
          <p class="ticket-eq">{{ eq(ticket.equipmentId) }}</p>
          <p class="ticket-desc">{{ ticket.description }}</p>
          <div class="ticket-bottom">
            <span class="ticket-age">{{ ticketAge(ticket.createdAt) }}</span>
            <button class="btn btn--outline" style="font-size:.75rem" @click="store.startTicket(ticket.id)">{{ t('maintenance.action.start') }}</button>
          </div>
        </div>
      </div>

      <div class="kanban-col card">
        <h3 class="col-header col-header--progress">{{ t('maintenance.col.inProgress') }} ({{ inProgressFiltered.length }})</h3>
        <p v-if="!inProgressFiltered.length" class="kanban-empty">{{ t('maintenance.col.empty') }}</p>
        <div v-for="ticket in inProgressFiltered" :key="ticket.id" class="ticket-card ticket-card--progress">
          <div class="ticket-top"><span class="ticket-id">{{ ticketId(ticket.id) }}</span><span class="badge" :class="`badge--${priorityClass(ticket.priority)}`">{{ ticket.priority }}</span></div>
          <p class="ticket-eq">{{ eq(ticket.equipmentId) }}</p>
          <p class="ticket-desc">{{ ticket.description }}</p>
          <div class="ticket-bottom">
            <span class="ticket-age">{{ ticketAge(ticket.createdAt) }}</span>
            <button class="btn btn--primary" style="font-size:.75rem" @click="store.completeTicket(ticket.id)">{{ t('maintenance.action.complete') }}</button>
          </div>
        </div>
      </div>

      <div class="kanban-col card">
        <h3 class="col-header col-header--resolved">{{ t('maintenance.col.completed') }} ({{ resolvedFiltered.length }})</h3>
        <p v-if="!resolvedFiltered.length" class="kanban-empty">{{ t('maintenance.col.empty') }}</p>
        <div v-for="ticket in resolvedFiltered" :key="ticket.id" class="ticket-card ticket-card--resolved">
          <div class="ticket-top"><span class="ticket-id">{{ ticketId(ticket.id) }}</span><span class="badge badge--green">{{ t('maintenance.status.RESOLVED') }}</span></div>
          <p class="ticket-eq">{{ eq(ticket.equipmentId) }}</p>
          <p class="ticket-desc">{{ ticket.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-row { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); margin-bottom: 1rem; }
.stat-card { align-items: center; display: flex; flex-direction: column; gap: .25rem; }
.stat-n { font-size: 1.75rem; font-weight: 700; }
.stat-n--amber { color: var(--accent); } .stat-n--blue { color: var(--blue); } .stat-n--green { color: var(--green); }
.stat-l { color: var(--text-secondary); font-size: 0.8rem; }
.filters { display: flex; gap: .75rem; margin-bottom: 1rem; }
.kanban-board { display: grid; gap: 1rem; grid-template-columns: repeat(3, 1fr); }
.kanban-col { display: flex; flex-direction: column; gap: .5rem; }
.col-header { font-size: .85rem; font-weight: 600; margin-bottom: .25rem; padding-bottom: .5rem; border-bottom: 1px solid var(--border); }
.col-header--open     { color: var(--accent); }
.col-header--progress { color: var(--blue); }
.col-header--resolved { color: var(--green); }
.kanban-empty { color: var(--text-secondary); font-size: .8rem; }
.ticket-card { border-left: 3px solid; border-radius: 6px; padding: .625rem .75rem; font-size: .82rem; }
.ticket-card--open     { background: rgba(245,188,54,.06); border-color: var(--accent); }
.ticket-card--progress { background: rgba(59,130,246,.06); border-color: var(--blue); }
.ticket-card--resolved { background: rgba(34,197,94,.06); border-color: var(--green); }
.ticket-top { align-items: center; display: flex; justify-content: space-between; margin-bottom: .25rem; }
.ticket-id  { color: var(--text-secondary); font-family: monospace; font-size: .75rem; }
.ticket-eq  { font-weight: 500; margin-bottom: .25rem; }
.ticket-desc{ color: var(--text-secondary); font-size: .78rem; }
.ticket-bottom { align-items: center; display: flex; justify-content: space-between; margin-top: .375rem; }
.ticket-age { color: var(--text-secondary); font-size: .72rem; }
@media (max-width: 900px) { .kanban-board, .stats-row { grid-template-columns: 1fr; } }
</style>
