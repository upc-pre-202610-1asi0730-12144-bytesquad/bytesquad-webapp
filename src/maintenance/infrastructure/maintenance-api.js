import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { MaintenanceTicketEndpoint } from './maintenance-ticket-endpoint.js';
import { MaintenanceScheduleEndpoint } from './maintenance-schedule-endpoint.js';

export class MaintenanceApi extends BaseApi {
  #tickets;
  #schedules;

  constructor() {
    super();
    this.#tickets   = new MaintenanceTicketEndpoint(this);
    this.#schedules = new MaintenanceScheduleEndpoint(this);
  }

  getTickets()             { return this.#tickets.getAll(); }
  createTicket(entity)     { return this.#tickets.create(entity); }
  updateTicket(entity)     { return this.#tickets.update(entity.id, entity); }
  deleteTicket(id)         { return this.#tickets.delete(id); }

  getSchedules()           { return this.#schedules.getAll(); }
  createSchedule(entity)   { return this.#schedules.create(entity); }
  updateSchedule(entity)   { return this.#schedules.update(entity.id, entity); }
  deleteSchedule(id)       { return this.#schedules.delete(id); }
}
