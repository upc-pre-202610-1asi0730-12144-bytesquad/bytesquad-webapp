import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MaintenanceApi } from '../infrastructure/maintenance-api.js';

const api = new MaintenanceApi();

export const useMaintenanceStore = defineStore('maintenance', () => {
  const maintenances   = ref([]);
  const jobs           = ref([]);
  const logs           = ref([]);
  const tickets        = ref([]);
  const technicians    = ref([]);
  const completionLogs = ref({});
  const loading        = ref(false);
  const error          = ref(null);

  const openTickets       = computed(() => tickets.value.filter(t => t.status === 'Created' || t.status === 'Assigned'));
  const inProgressTickets = computed(() => tickets.value.filter(t => t.status === 'InProgress'));
  const resolvedTickets   = computed(() => tickets.value.filter(t => t.status === 'Resolved'));

  function _upsertTicket(updated) {
    const idx = tickets.value.findIndex(t => t.id === updated.id);
    if (idx >= 0) tickets.value = tickets.value.map(t => t.id === updated.id ? updated : t);
    else tickets.value = [...tickets.value, updated];
  }

  function _upsertMaintenance(updated) {
    const idx = maintenances.value.findIndex(m => m.id === updated.id);
    if (idx >= 0) maintenances.value = maintenances.value.map(m => m.id === updated.id ? updated : m);
    else maintenances.value = [...maintenances.value, updated];
  }

  // ── Maintenance ────────────────────────────────────────────────────────────
  async function loadMaintenancesByEquipment(equipmentId) {
    loading.value = true; error.value = null;
    try {
      maintenances.value = await api.getMaintenancesByEquipment(equipmentId);
    } catch (e) {
      error.value = e.message || 'Failed to load maintenances';
    } finally { loading.value = false; }
  }

  async function requestMaintenance(dto) {
    loading.value = true; error.value = null;
    try {
      const created = await api.requestMaintenance(dto);
      _upsertMaintenance(created);
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to request maintenance';
    } finally { loading.value = false; }
  }

  // ── MaintenanceJob ─────────────────────────────────────────────────────────
  async function acceptJob(dto) {
    loading.value = true; error.value = null;
    try {
      const created = await api.acceptJob(dto);
      jobs.value = [...jobs.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to accept job';
    } finally { loading.value = false; }
  }

  // ── Technicians ────────────────────────────────────────────────────────────
  async function loadTechnicians() {
    try {
      technicians.value = await api.getMyTechnicians();
    } catch (e) { error.value = e.message; }
  }

  async function registerTechnician(dto) {
    loading.value = true; error.value = null;
    try {
      const created = await api.registerTechnician(dto);
      technicians.value = [...technicians.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to register technician';
    } finally { loading.value = false; }
  }

  // ── MaintenanceLog ─────────────────────────────────────────────────────────
  async function loadLogsByAdmin(adminId) {
    try {
      logs.value = await api.getLogsByAdmin(adminId);
    } catch (e) { error.value = e.message; }
  }

  async function loadCompletionLog(ticketId) {
    if (completionLogs.value[ticketId]) return;
    try {
      const log = await api.getCompletionLog(ticketId);
      completionLogs.value = { ...completionLogs.value, [ticketId]: log };
    } catch (e) { error.value = e.message; }
  }

  async function createLog(dto) {
    loading.value = true; error.value = null;
    try {
      const created = await api.createLog(dto);
      logs.value = [...logs.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create log';
    } finally { loading.value = false; }
  }

  // ── TechnicalTicket ────────────────────────────────────────────────────────
  async function loadTickets(adminId) {
    loading.value = true; error.value = null;
    try {
      tickets.value = await api.getTickets(adminId);
    } catch (e) {
      error.value = e.message || 'Failed to load tickets';
    } finally { loading.value = false; }
  }

  async function getTicketById(id) {
    loading.value = true; error.value = null;
    try {
      const found = await api.getTicketById(id);
      _upsertTicket(found);
      return found;
    } catch (e) {
      error.value = e.message || 'Failed to load ticket';
    } finally { loading.value = false; }
  }

  async function createTicket(dto) {
    loading.value = true; error.value = null;
    try {
      const created = await api.createTicket(dto);
      tickets.value = [...tickets.value, created];
      return created;
    } catch (e) {
      error.value = e.message || 'Failed to create ticket';
    } finally { loading.value = false; }
  }

  async function updateTicketStatus(id, status) {
    loading.value = true; error.value = null;
    try {
      const updated = await api.updateTicketStatus(id, status);
      _upsertTicket(updated);
      return updated;
    } catch (e) {
      error.value = e.message || 'Failed to update ticket status';
      throw e;
    } finally { loading.value = false; }
  }

  async function updateTicketMaintenanceProgress(id, prog) {
    loading.value = true; error.value = null;
    try {
      const updated = await api.updateTicketMaintenanceProgress(id, prog);
      _upsertTicket(updated);
      return updated;
    } catch (e) {
      error.value = e.message || 'Failed to update maintenance progress';
      throw e;
    } finally { loading.value = false; }
  }

  async function completeTicketFlow(id, notes = '') {
    await updateTicketMaintenanceProgress(id, 'Completed');
    return completeTicket(id, notes);
  }

  async function assignTicket(id, technicianId) {
    loading.value = true; error.value = null;
    try {
      const updated = await api.assignTicket(id, technicianId);
      _upsertTicket(updated);
      return updated;
    } catch (e) {
      error.value = e.message || 'Failed to assign ticket';
    } finally { loading.value = false; }
  }

  async function requestTicketStatusUpdate(id) {
    loading.value = true; error.value = null;
    try {
      await api.requestStatusUpdate(id);
    } catch (e) {
      error.value = e.message || 'Failed to request status update';
    } finally { loading.value = false; }
  }

  async function completeTicket(id, notes = '') {
    loading.value = true; error.value = null;
    try {
      const updated = await api.completeTicket(id, notes);
      _upsertTicket(updated);
      return updated;
    } catch (e) {
      error.value = e.message || 'Failed to complete ticket';
    } finally { loading.value = false; }
  }

  async function createTicketWithMaintenance({ equipmentId, requestedByAdminId, description, priority, type }) {
    loading.value = true; error.value = null;
    try {
      const maintenance = await api.requestMaintenance({
        equipmentId, requestedByAdminId, reason: description, priority, type,
      });
      const ticket = await api.createTicket({
        maintenanceId: maintenance.id, equipmentId, description,
      });
      tickets.value = [...tickets.value, ticket];
      return ticket;
    } catch (e) {
      error.value = e.message || 'Failed to create ticket';
      throw e;
    } finally { loading.value = false; }
  }

  return {
    maintenances, jobs, logs, tickets, technicians, completionLogs, loading, error,
    openTickets, inProgressTickets, resolvedTickets,
    loadMaintenancesByEquipment, requestMaintenance,
    acceptJob, createLog,
    loadTickets, getTicketById, createTicket, createTicketWithMaintenance,
    loadTechnicians, registerTechnician,
    loadLogsByAdmin, loadCompletionLog,
    updateTicketStatus, updateTicketMaintenanceProgress,
    assignTicket, requestTicketStatusUpdate, completeTicket, completeTicketFlow,
  };
});
