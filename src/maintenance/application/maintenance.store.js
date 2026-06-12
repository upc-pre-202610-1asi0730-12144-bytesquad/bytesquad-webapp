import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MaintenanceApi } from '../infrastructure/maintenance-api.js';
import { MaintenanceTicket, TicketStatus, TicketPriority, TicketType } from '../domain/model/maintenance-ticket.entity.js';
import { MaintenanceSchedule, TaskType, ScheduleStatus } from '../domain/model/maintenance-schedule.entity.js';

const api = new MaintenanceApi();

const PEAK_RANGES = [[6, 9], [18, 21]];

const FAKE_TICKETS = [
  { id: 1001, equipmentId: 3,  status: TicketStatus.OPEN,        priority: TicketPriority.HIGH,   type: TicketType.CORRECTIVE,  createdAt: '2026-06-10T08:15:00Z', description: 'maintenance.tickets.t1001', assignee: 'Carlos Mendez',   completedBy: '' },
  { id: 1002, equipmentId: 7,  status: TicketStatus.OPEN,        priority: TicketPriority.URGENT, type: TicketType.CORRECTIVE,  createdAt: '2026-06-11T14:30:00Z', description: 'maintenance.tickets.t1002', assignee: 'Ana Torres',      completedBy: '' },
  { id: 1003, equipmentId: 16, status: TicketStatus.OPEN,        priority: TicketPriority.MEDIUM, type: TicketType.PREVENTIVE,  createdAt: '2026-06-12T07:00:00Z', description: 'maintenance.tickets.t1003', assignee: 'Luis Paredes',    completedBy: '' },
  { id: 1004, equipmentId: 11, status: TicketStatus.IN_PROGRESS, priority: TicketPriority.HIGH,   type: TicketType.CORRECTIVE,  createdAt: '2026-06-09T11:00:00Z', description: 'maintenance.tickets.t1004', assignee: 'Miguel Salas',    completedBy: '' },
  { id: 1005, equipmentId: 6,  status: TicketStatus.IN_PROGRESS, priority: TicketPriority.MEDIUM, type: TicketType.PREVENTIVE,  createdAt: '2026-06-08T09:45:00Z', description: 'maintenance.tickets.t1005', assignee: 'Sofia Rios',      completedBy: '' },
  { id: 1006, equipmentId: 2,  status: TicketStatus.IN_PROGRESS, priority: TicketPriority.LOW,    type: TicketType.PREVENTIVE,  createdAt: '2026-06-07T13:20:00Z', description: 'maintenance.tickets.t1006', assignee: 'Carlos Mendez',   completedBy: '' },
  { id: 1007, equipmentId: 4,  status: TicketStatus.RESOLVED,    priority: TicketPriority.HIGH,   type: TicketType.CORRECTIVE,  createdAt: '2026-06-05T10:00:00Z', description: 'maintenance.tickets.t1007', assignee: 'Ana Torres',      completedBy: 'Ana Torres' },
  { id: 1008, equipmentId: 8,  status: TicketStatus.RESOLVED,    priority: TicketPriority.LOW,    type: TicketType.PREVENTIVE,  createdAt: '2026-06-04T08:30:00Z', description: 'maintenance.tickets.t1008', assignee: 'Luis Paredes',    completedBy: 'Luis Paredes' },
  { id: 1009, equipmentId: 1,  status: TicketStatus.RESOLVED,    priority: TicketPriority.MEDIUM, type: TicketType.CORRECTIVE,  createdAt: '2026-06-03T15:10:00Z', description: 'maintenance.tickets.t1009', assignee: 'Miguel Salas',    completedBy: 'Miguel Salas' },
  { id: 1010, equipmentId: 13, status: TicketStatus.RESOLVED,    priority: TicketPriority.LOW,    type: TicketType.PREVENTIVE,  createdAt: '2026-06-01T09:00:00Z', description: 'maintenance.tickets.t1010', assignee: 'Sofia Rios',      completedBy: 'Sofia Rios' },
].map(d => new MaintenanceTicket(d));
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
      tickets.value   = t.length ? t : FAKE_TICKETS;
      schedules.value = s;
    } catch {
      tickets.value = FAKE_TICKETS;
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
