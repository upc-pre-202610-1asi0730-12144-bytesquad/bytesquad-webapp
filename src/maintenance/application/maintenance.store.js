import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MaintenanceApi } from '../infrastructure/maintenance-api.js';
import { MaintenanceTicket, TicketStatus, TicketPriority, TicketType } from '../domain/model/maintenance-ticket.entity.js';
import { MaintenanceSchedule, TaskType, ScheduleStatus } from '../domain/model/maintenance-schedule.entity.js';

const api = new MaintenanceApi();

const PEAK_RANGES = [[6, 9], [18, 21]];
export const OFF_PEAK_SUGGESTIONS = ['10:00', '11:00', '14:00', '15:00'];

export const useMaintenanceStore = defineStore('maintenance', () => {
  const tickets       = ref([]);
  const schedules     = ref([]);
  const loading       = ref(false);
  const error         = ref(null);
  const lastScheduled = ref(null);

  const pendingTickets    = computed(() => tickets.value.filter(t => t.status === TicketStatus.OPEN));
  const inProgressTickets = computed(() => tickets.value.filter(t => t.status === TicketStatus.IN_PROGRESS));
  const resolvedTickets   = computed(() => tickets.value.filter(t => t.status === TicketStatus.RESOLVED));
  const totalTickets      = computed(() => tickets.value.length);
  const scheduledCount    = computed(() => schedules.value.length);

  function isPeakHour(time) {
    if (!time) return false;
    const h = parseInt(time.split(':')[0], 10);
    return PEAK_RANGES.some(([s, e]) => h >= s && h < e);
  }

  async function loadAll() {
    loading.value = true; error.value = null;
    try {
      const [t, s] = await Promise.all([api.getTickets(), api.getSchedules()]);
      tickets.value   = t;
      schedules.value = s;
    } catch (e) {
      error.value = e.message || 'Failed to load maintenance data';
    } finally { loading.value = false; }
  }

  function startTicket(ticketId) {
    tickets.value = tickets.value.map(t =>
      t.id === ticketId ? { ...t, status: TicketStatus.IN_PROGRESS } : t
    );
  }

  function completeTicket(ticketId, completedBy = 'Admin') {
    tickets.value = tickets.value.map(t =>
      t.id === ticketId ? { ...t, status: TicketStatus.RESOLVED, completedBy } : t
    );
  }

  function createTicket(equipmentId, description, priority, type) {
    const ticket = new MaintenanceTicket({
      id: Date.now(), equipmentId, status: TicketStatus.OPEN, priority, type,
      createdAt: new Date().toISOString(), description, assignee: '', completedBy: '',
    });
    tickets.value = [ticket, ...tickets.value];
  }

  async function scheduleBlock(equipmentId, date, time, taskType, notes) {
    loading.value = true; error.value = null; lastScheduled.value = null;
    try {
      const s = new MaintenanceSchedule({ id: 0, equipmentId, scheduledDate: date, scheduledTime: time, taskType, notes, status: ScheduleStatus.CONFIRMED });
      const created = await api.createSchedule(s);
      schedules.value = [created, ...schedules.value];
      lastScheduled.value = created;
    } catch (e) {
      error.value = e.message || 'Failed to schedule';
    } finally { loading.value = false; }
  }

  function clearLastScheduled() { lastScheduled.value = null; }

  loadAll();

  return { tickets, schedules, loading, error, lastScheduled, pendingTickets, inProgressTickets, resolvedTickets, totalTickets, scheduledCount, isPeakHour, loadAll, startTicket, completeTicket, createTicket, scheduleBlock, clearLastScheduled, OFF_PEAK_SUGGESTIONS: OFF_PEAK_SUGGESTIONS };
});
